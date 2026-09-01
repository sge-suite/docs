import { access, readdir, readFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import YAML from "yaml"

const root = process.cwd()
const sourceRoot = path.resolve(root, process.env.SGE_SOURCE_ROOT ?? "../sge")
const contentRoots = [
  "01 - Contexto",
  "02 - Arquitetura",
  "03 - Domínio e dados",
  "04 - Fluxos",
  "05 - Operação",
  "06 - Planejamento",
]
const supportedStatuses = new Set([
  "planned",
  "defined",
  "in-progress",
  "implemented",
  "maintained",
  "observed",
  "completed",
  "archived",
])
const problems = []

const relative = (file) => path.relative(root, file)
const isPublicFile = (file) =>
  file === path.join(root, "index.md") ||
  [
    "01 - Contexto",
    "02 - Arquitetura",
    "03 - Domínio e dados",
    "04 - Fluxos",
    "05 - Operação",
    "06 - Planejamento",
  ].some(
    (directory) => relative(file).startsWith(`${directory}${path.sep}`),
  )
const isInternalFile = (file) =>
  ["07 - Levantamento"].some((directory) =>
    relative(file).startsWith(`${directory}${path.sep}`),
  )

function problem(file, message) {
  problems.push(`${relative(file)}: ${message}`)
}

async function exists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

async function collectFiles(directory, extensions) {
  const result = []

  if (!(await exists(directory))) {
    return result
  }

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      result.push(...(await collectFiles(file, extensions)))
    } else if (extensions.has(path.extname(entry.name))) {
      result.push(file)
    }
  }

  return result
}

function normalise(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLocaleLowerCase("pt-BR")
}

function frontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) {
    return null
  }

  const document = YAML.parseDocument(match[1])
  return { data: document.toJS(), errors: document.errors }
}

function headings(raw) {
  return raw
    .split(/\r?\n/)
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) => normalise(line.replace(/^#{1,6}\s+/, "").replace(/\s+#+\s*$/, "")))
}

const markdownFiles = [path.join(root, "index.md")]
for (const directory of contentRoots) {
  markdownFiles.push(...(await collectFiles(path.join(root, directory), new Set([".md"]))))
}

const linkableFiles = [...markdownFiles]
for (const directory of contentRoots) {
  linkableFiles.push(
    ...(await collectFiles(path.join(root, directory), new Set([".canvas", ".base"]))),
  )
}

const names = new Map()
const addName = (name, file) => {
  const key = normalise(name)
  const known = names.get(key) ?? []
  known.push(file)
  names.set(key, known)
}

for (const file of linkableFiles) {
  addName(path.basename(file), file)
  addName(path.basename(file, path.extname(file)), file)
}

const notes = new Map()
for (const file of markdownFiles) {
  const raw = await readFile(file, "utf8")
  const matter = frontmatter(raw)

  if (!matter) {
    problem(file, "frontmatter ausente")
    continue
  }

  if (matter.errors.length > 0) {
    problem(file, `frontmatter YAML inválido: ${matter.errors[0].message}`)
    continue
  }

  const data = matter.data ?? {}
  for (const property of ["title", "description", "type", "status"]) {
    if (typeof data[property] !== "string" || data[property].trim() === "") {
      problem(file, `propriedade obrigatória ausente ou inválida: ${property}`)
    }
  }

  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    problem(file, "propriedade obrigatória ausente ou inválida: tags")
  }

  if (typeof data.status === "string" && !supportedStatuses.has(data.status)) {
    problem(file, `status não suportado: ${data.status}`)
  }

  for (const property of ["code_path", "test_path"]) {
    if (data[property] === undefined) {
      continue
    }

    if (typeof data[property] !== "string" || data[property].trim() === "") {
      problem(file, `${property} deve ser um caminho relativo não vazio`)
      continue
    }

    if (path.isAbsolute(data[property])) {
      problem(file, `${property} deve ser relativo à raiz Laravel, não absoluto`)
      continue
    }

    if (!(await exists(path.resolve(sourceRoot, data[property])))) {
      problem(file, `${property} não existe em ${data[property]}`)
    }
  }

  for (const alias of data.aliases ?? []) {
    if (typeof alias === "string") {
      addName(alias, file)
    }
  }

  notes.set(file, { headings: headings(raw), raw })
}

for (const [file, note] of notes) {
  const links = note.raw.matchAll(/!?\[\[([^\]]+)\]\]/g)

  for (const match of links) {
    const [targetWithAnchor] = match[1].split("|")
    const [target, anchor] = targetWithAnchor.split("#", 2)
    let candidates = target === "" ? [file] : names.get(normalise(target)) ?? []
    candidates = [...new Set(candidates)]

    if (candidates.length > 1 && path.extname(target) === "") {
      const markdownCandidates = candidates.filter((candidate) => candidate.endsWith(".md"))
      if (markdownCandidates.length === 1) {
        candidates = markdownCandidates
      }
    }

    if (candidates.length === 0) {
      problem(file, `wikilink sem destino: [[${match[1]}]]`)
      continue
    }

    if (candidates.length > 1) {
      problem(file, `wikilink ambíguo: [[${match[1]}]]`)
      continue
    }

    if (isPublicFile(file) && isInternalFile(candidates[0])) {
      problem(file, `conteúdo público aponta para nota interna: [[${match[1]}]]`)
    }

    if (!anchor || !candidates[0].endsWith(".md")) {
      continue
    }

    const targetNote = notes.get(candidates[0])
    if (!targetNote || !targetNote.headings.includes(normalise(anchor))) {
      problem(file, `heading ausente no wikilink: [[${match[1]}]]`)
    }
  }
}

for (const file of linkableFiles.filter((item) => item.endsWith(".base"))) {
  const document = YAML.parseDocument(await readFile(file, "utf8"))
  if (document.errors.length > 0) {
    problem(file, `Base YAML inválida: ${document.errors[0].message}`)
  }
}

for (const file of linkableFiles.filter((item) => item.endsWith(".canvas"))) {
  let canvas

  try {
    canvas = JSON.parse(await readFile(file, "utf8"))
  } catch (error) {
    problem(file, `Canvas JSON inválido: ${error.message}`)
    continue
  }

  if (!Array.isArray(canvas.nodes) || !Array.isArray(canvas.edges)) {
    problem(file, "Canvas deve conter arrays nodes e edges")
    continue
  }

  const ids = [...canvas.nodes, ...canvas.edges].map((item) => item.id)
  if (ids.some((id, index) => typeof id !== "string" || ids.indexOf(id) !== index)) {
    problem(file, "Canvas possui IDs ausentes ou duplicados")
  }

  const nodeIds = new Set(canvas.nodes.map((node) => node.id))
  for (const edge of canvas.edges) {
    if (!nodeIds.has(edge.fromNode) || !nodeIds.has(edge.toNode)) {
      problem(file, `Canvas possui conexão sem nó: ${edge.id}`)
    }
  }

  for (const node of canvas.nodes.filter((node) => node.type === "file")) {
    if (typeof node.file !== "string" || !(await exists(path.resolve(root, node.file)))) {
      problem(file, `Canvas possui arquivo ausente: ${node.file}`)
      continue
    }

    const target = path.resolve(root, node.file)
    if (isPublicFile(file) && isInternalFile(target)) {
      problem(file, `Canvas público aponta para nota interna: ${node.file}`)
    }
  }
}

if (problems.length > 0) {
  console.error("Documentação inválida:\n")
  for (const item of problems) {
    console.error(`- ${item}`)
  }
  process.exitCode = 1
} else {
  console.log(`Documentação válida: ${markdownFiles.length} notas verificadas.`)
}
