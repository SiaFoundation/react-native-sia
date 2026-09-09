// Checks the tarball npm would publish rather than the working tree, because
// nothing else does. npm ships a dangling entry point without complaint, and
// react-native-builder-bob and typescript decide the shape and the content of
// lib/, so upgrading either can move a file or change a signature without
// failing the build that produced it. Run after `yarn prepare`.

import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'))

// Generated output. Which of these exists depends on the caller: PR CI builds
// Android only, the release build also produces ios/ and the xcframework. So
// each is required in the tarball only when the working tree has it.
const NATIVE_DIRS = ['cpp', 'ios', 'android/src/main/jniLibs', 'SiaFramework.xcframework']

// Matched against the start of an entry, so a lib/scripts/ emitted by bob is
// not mistaken for the repo's own scripts/.
const NEVER_SHIP_ROOTS = [
  '.github/',
  '.yarn/',
  'example/',
  'node_modules/',
  'patch/',
  'rust_modules/',
  'scripts/',
]

const problems = []
const fail = (msg) => problems.push(msg)

// Every path package.json points at, flattened out of main, types and exports.
function advertisedPaths() {
  const found = new Set()
  const walk = (v) => {
    if (typeof v === 'string' && v.startsWith('./')) found.add(v.slice(2))
    else if (v && typeof v === 'object') Object.values(v).forEach(walk)
  }
  ;[pkg.main, pkg.types, pkg.exports].forEach(walk)
  return [...found]
}

const tmp = mkdtempSync(path.join(tmpdir(), 'sia-pkg-'))
try {
  // --ignore-scripts stops `prepare` re-running bob underneath us.
  const tarball = path.join(
    tmp,
    execFileSync('npm', ['pack', '--ignore-scripts', '--pack-destination', tmp], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
      .trim()
      .split('\n')
      .pop()
  )

  // npm prefixes every entry with `package/`.
  const entries = execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
    .map((e) => e.replace(/^package\//, ''))
  const entrySet = new Set(entries)

  for (const p of advertisedPaths()) {
    if (!entrySet.has(p)) {
      fail(`package.json points at ${p}, which the tarball does not contain`)
    }
  }

  for (const dir of NATIVE_DIRS) {
    const shipped = entries.some((e) => e === dir || e.startsWith(`${dir}/`))
    if (existsSync(path.join(ROOT, dir)) && !shipped) {
      fail(`${dir} exists in the working tree but is missing from the tarball`)
    }
  }

  for (const root of NEVER_SHIP_ROOTS) {
    const hit = entries.find((e) => e.startsWith(root))
    if (hit) fail(`tarball contains ${hit}, which should never be published`)
  }
  const testFile = entries.find((e) => e.split('/').includes('__tests__'))
  if (testFile) fail(`tarball contains ${testFile}, which should never be published`)

  // Typecheck the way a consumer resolves the package, through the exports
  // map, rather than through the tsconfig alias that points back into src/.
  // skipLibCheck matches what a real app sets, so the emitted declarations are
  // not checked internally; naming the return type below is what makes a
  // changed signature fail. Both names come from the generated bindings, so
  // renaming one in the Rust crate breaks this on purpose.
  const proj = path.join(tmp, 'consumer')
  const mods = path.join(proj, 'node_modules')
  mkdirSync(mods, { recursive: true })
  execFileSync('tar', ['-xzf', tarball, '-C', mods])
  renameSync(path.join(mods, 'package'), path.join(mods, pkg.name))

  writeFileSync(
    path.join(proj, 'consumer.ts'),
    [
      `import { initSia, generateRecoveryPhrase } from '${pkg.name}'`,
      `export async function main(): Promise<string> {`,
      `  await initSia()`,
      `  const phrase: string = generateRecoveryPhrase()`,
      `  return phrase`,
      `}`,
      ``,
    ].join('\n')
  )
  writeFileSync(
    path.join(proj, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          lib: ['ESNext'],
          module: 'ESNext',
          moduleResolution: 'bundler',
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: 'ESNext',
        },
        files: ['consumer.ts'],
      },
      null,
      2
    )
  )

  try {
    // cwd is the temp project so tsc reports consumer.ts rather than a path
    // with a dozen ../ segments in it.
    execFileSync(path.join(ROOT, 'node_modules', '.bin', 'tsc'), ['--project', '.'], {
      cwd: proj,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
  } catch (e) {
    fail(`a consumer importing ${pkg.name} does not typecheck:\n${e.stdout || e.message}`)
  }

  if (problems.length) {
    const label = problems.length === 1 ? 'problem' : 'problems'
    console.error(`\n${problems.length} ${label} with the published package:\n`)
    for (const p of problems) console.error(`  - ${p}`)
    process.exit(1)
  }
  console.log(
    `Package check passed: ${entries.length} files, entry points resolve, consumer typechecks.`
  )
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
