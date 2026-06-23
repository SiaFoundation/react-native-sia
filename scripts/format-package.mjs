#!/usr/bin/env node
// Normalize package.json formatting after Knope's PrepareRelease rewrites the
// version — Knope's JSON writer can drop the trailing newline, which prettier
// and editors flag.
import { readFileSync, writeFileSync } from 'node:fs'

const path = 'package.json'
const pkg = JSON.parse(readFileSync(path, 'utf-8'))
writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`)
