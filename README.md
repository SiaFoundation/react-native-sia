# react-native-sia

The Sia SDK for React Native.

## Installation

```sh
npm install react-native-sia
```

## Usage

```js
import { getHostSettings } from 'react-native-sia';

// ...

const result = await getHostSettings('127.0.0.1', 9980);
```

## Build scripts

- `yarn ubrn:ios`
  - Uses UBRN to:
    - Build the Rust crate for iOS and iOS Simulator (via Cargo).
    - Create the XCFramework from the static libraries.
    - Generate UniFFI bindings (TypeScript + C++ glue) and the TurboModule.
    - Run `pod install` in the example app so Xcode picks up the framework and module.
  - Note: because of Rust 2024 edition dependencies, this runs with nightly toolchain.

- `yarn prepare` (react-native-builder-bob)
  - Builds the JavaScript/TypeScript distribution for publishing:
    - Transpiles `src/` to `lib/module` (ES/CJS).
    - Emits type declarations to `lib/typescript`.
