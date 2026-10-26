---
default: patch
---

#### Modernize the build toolchain

Declarations are now emitted by TypeScript 7, and the bindings generator moves
to 0.31.0-5, which puts its TypeScript runtime in `@ubjs/core`. That package is
a dependency now and installs alongside this one.
