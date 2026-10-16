---
default: patch
---

#### Fix Android builds on Android Gradle Plugin 9

The package now ships the consumer ProGuard file its `build.gradle` names. Android Gradle Plugin 9 failed any app build that included the library because the file was missing.
