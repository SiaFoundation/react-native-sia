# react-native-sia

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
