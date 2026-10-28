# react-native-sia

## 0.16.2 (2026-10-28)

### Fixes

#### Modernize the build toolchain

Declarations are now emitted by TypeScript 7, and the bindings generator moves
to 0.31.0-5, which puts its TypeScript runtime in `@ubjs/core`. That package is
a dependency now and installs alongside this one.

#### Update Sia SDK to 0.13.3

See the [sia-sdk-rs release notes](https://github.com/SiaFoundation/sia-sdk-rs/releases/tag/sia_storage_ffi/v0.13.3).

## 0.16.1 (2026-10-23)

### Fixes

#### Publish the iOS build and support React Native 0.88

0.16.0 was never published to npm because its iOS device build failed to link. This is the first release on npm with the Sia SDK v0.13.2 update and the breaking changes listed under 0.16.0.

The package is built and tested against React Native 0.88 and React 19.3, with Xcode 26. The example app follows the React Native 0.88 template, including the scene delegate that apps built with the iOS 27 SDK need to launch.

## 0.16.0 (2026-10-21)

### Breaking Changes

#### Update Sia SDK to v0.13.2

Breaking changes from the SDK's 0.13.0 release:

- `Sdk.slab(id)` and the `PinnedSlab` type are removed.
- `Sdk.pruneSlabs(before)` takes a cutoff and prunes only slabs pinned before it. Pass `undefined` to let the indexer choose the cutoff.
- `encodedSize(size, dataShards, parityShards)` throws when `dataShards` is zero.

See the [sia-sdk-rs release notes](https://github.com/SiaFoundation/sia-sdk-rs/releases) for [v0.13.0](https://github.com/SiaFoundation/sia-sdk-rs/releases/tag/sia_storage_ffi/v0.13.0), [v0.13.1](https://github.com/SiaFoundation/sia-sdk-rs/releases/tag/sia_storage_ffi/v0.13.1) and [v0.13.2](https://github.com/SiaFoundation/sia-sdk-rs/releases/tag/sia_storage_ffi/v0.13.2).

## 0.15.4 (2026-10-16)

### Fixes

#### Fix Android builds on Android Gradle Plugin 9

The package now ships the consumer ProGuard file its `build.gradle` names. Android Gradle Plugin 9 failed any app build that included the library because the file was missing.

## 0.15.3 (2026-09-16)

### Fixes

#### Update Sia SDK to v0.12.0

See the [sia-sdk-rs release notes](https://github.com/SiaFoundation/sia-sdk-rs/releases/tag/sia_storage_ffi/v0.12.0).

## 0.15.2 (2026-08-10)

### Fixes

#### Update Sia SDK to v0.10.0

See the [sia-sdk-rs release notes](https://github.com/SiaFoundation/sia-sdk-rs/releases/tag/sia_storage_ffi/v0.10.0).

## 0.15.1 (2026-06-24)

### Fixes

#### Fixed a white screen on launch on some 32-bit Android devices

Restored the 32-bit ARM (armeabi-v7a) build that was dropped in 0.14.0.

#### Update Sia SDK to v0.9.0

See the [sia-sdk-rs release notes](https://github.com/SiaFoundation/sia-sdk-rs/releases/tag/sia_storage_ffi/v0.9.0).

## 0.15.0

### Minor Changes

- a093523: Update the underlying Sia SDK with faster, more reliable transfers:
  - Faster large downloads: requests now ramp up to reduce round trips, and slow hosts are routed around by fetching extra shards in parallel to cut tail latency.
  - Smarter host selection: hosts are now ranked by their current upload/download load, and fallback hosts are only used when a transfer is genuinely lagging, so they no longer slow down higher-priority work.
  - More reliable under heavy parallel load: fixed crashes that could occur at high concurrency and improved connection cleanup.
  - `DownloadOptions.maxInflight` now accepts values above 255 (the field is still a `number` in TypeScript, so existing code is unaffected).

## 0.6.6

### Patch Changes

- Update SDK.

## 0.6.5

### Patch Changes

- Update SDK.

## 0.6.4

### Patch Changes

- Update SDK.

## 0.6.3

### Patch Changes

- Update SDK.

## 0.6.2

### Patch Changes

- Update SDK.

## 0.6.1

### Patch Changes

- Update SDK.

## 0.6.0

### Minor Changes

- Update SDK.

## 0.5.0

### Minor Changes

- Update sdk.

## 0.4.0

### Minor Changes

- Updated sdk.

## 0.3.0

### Minor Changes

- Updated sdk.

## 0.2.0

### Minor Changes

- Switch to building main sdk branch.

## 0.1.0

### Minor Changes

- 7b63a5b: Initial version with full sdk.

## 0.0.5

### Patch Changes

- Test publishing with artifacts.

## 0.0.4

### Patch Changes

- Add binaries to package.

## 0.0.3

### Patch Changes

- Add SiaFramework.xcframework to package.

## 0.0.2

### Patch Changes

- 1ce694f: Initialize versioning.
