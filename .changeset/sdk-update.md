---
default: major
---

#### Update Sia SDK to v0.13.2

Breaking changes from the SDK's 0.13.0 release:

- `Sdk.slab(id)` and the `PinnedSlab` type are removed.
- `Sdk.pruneSlabs(before)` takes a cutoff and prunes only slabs pinned before it. Pass `undefined` to let the indexer choose the cutoff.
- `encodedSize(size, dataShards, parityShards)` throws when `dataShards` is zero.

See the [sia-sdk-rs release notes](https://github.com/SiaFoundation/sia-sdk-rs/releases) for [v0.13.0](https://github.com/SiaFoundation/sia-sdk-rs/releases/tag/sia_storage_ffi/v0.13.0), [v0.13.1](https://github.com/SiaFoundation/sia-sdk-rs/releases/tag/sia_storage_ffi/v0.13.1) and [v0.13.2](https://github.com/SiaFoundation/sia-sdk-rs/releases/tag/sia_storage_ffi/v0.13.2).
