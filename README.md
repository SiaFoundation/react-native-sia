# react-native-sia

The Sia Storage SDK for React Native. Upload, download, and share encrypted, erasure-coded data on the [Sia](https://sia.tech) network from iOS and Android.

## Install

```sh
npm install react-native-sia
```

iOS — install the pod:

```sh
cd ios && pod install
```

Android — nothing extra; the Gradle plugin links the library automatically.

## Quick start

```ts
import {
  initSia,
  AppKey,
  Builder,
  generateRecoveryPhrase,
} from 'react-native-sia'
import { Linking } from 'react-native'

await initSia()

// A 32-byte identifier unique to your app. Not secret, but should be stable.
const appId = new Uint8Array(32).fill(2).buffer

const builder = new Builder('https://sia.storage', {
  id: appId,
  name: 'My App',
  description: 'An app on Sia',
  serviceUrl: 'https://myapp.com',
  callbackUrl: 'myapp://callback',
  logoUrl: 'https://myapp.com/logo.png',
})

const phrase = generateRecoveryPhrase()
await builder.requestConnection()
await Linking.openURL(builder.responseUrl())  // user approves in the browser
await builder.waitForApproval()
const sdk = await builder.register(phrase)

// Persist the app key to the Keychain / Keystore.
const appKeyBytes = sdk.appKey().export_()    // 32 bytes
```

Reconnecting a returning user:

```ts
const builder = new Builder(indexerUrl, appMeta)
const sdk = await builder.connected(new AppKey(savedAppKeyBytes))
if (!sdk) {
  // app key isn't authorized for this indexer — restart the approval flow.
}
```

## Upload

`sdk.upload` consumes a `Reader` — an object with `read(): Promise<ArrayBuffer>` that yields chunks and returns an empty buffer at EOF.

```ts
import { PinnedObject } from 'react-native-sia'

function bufferReader(data: ArrayBuffer, chunkSize = 256 * 1024) {
  let offset = 0
  return {
    async read() {
      if (offset >= data.byteLength) return new ArrayBuffer(0)
      const end = Math.min(offset + chunkSize, data.byteLength)
      const chunk = data.slice(offset, end)
      offset = end
      return chunk
    },
  }
}

const object = await sdk.upload(new PinnedObject(), bufferReader(data), {})
await sdk.pinObject(object)
```

`object.id()` is the content hash. `object.size()`, `object.encodedSize()`, `object.slabs()`, and `object.metadata()` round out what you can read back.

For many small files, share slabs via `uploadPacked`:

```ts
const packed = await sdk.uploadPacked({})
await packed.add(bufferReader(fileA))
await packed.add(bufferReader(fileB))
for (const obj of await packed.finalize()) await sdk.pinObject(obj)
```

## Download

```ts
const object = await sdk.object(key)
const download = sdk.download(object, {})

const chunks: ArrayBuffer[] = []
while (true) {
  const chunk = await download.read()
  if (chunk.byteLength === 0) break
  chunks.push(chunk)
}
```

## Share

```ts
const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
const url = sdk.shareObject(object, validUntil)

// On the receiving side:
const shared = await sdk.sharedObject(url)
const dl = sdk.download(shared, {})
```

## API

### Top-level

| | |
|---|---|
| `initSia()` | Initialize. Call once before anything else. |
| `generateRecoveryPhrase()` | New 12-word BIP-39 phrase. |
| `validateRecoveryPhrase(phrase)` | Throws on invalid. |
| `encodedSize(size, dataShards, parityShards)` | Encoded size after erasure coding. |
| `setLogger(logger, level)` | Receive SDK logs (`'trace' \| 'debug' \| 'info' \| 'warn' \| 'error'`). |

### `Builder`

`new Builder(indexerUrl, appMeta)` — `appMeta` is `{ id: ArrayBuffer (32 bytes), name, description, serviceUrl, logoUrl?, callbackUrl? }`.

| | |
|---|---|
| `connected(appKey)` | Reconnect with a saved `AppKey` → `Sdk \| null`. |
| `requestConnection()` | Start the approval flow. |
| `responseUrl()` | URL to show the user. |
| `waitForApproval()` | Resolves once the user approves. |
| `register(mnemonic)` | Finish onboarding with a recovery phrase → `Sdk`. |

### `Sdk`

Returned from `Builder.register()` or `Builder.connected()`.

| | |
|---|---|
| `appKey()` | The `AppKey` for this session. |
| `upload(object, reader, options)` | Upload from a `Reader`. Pass `new PinnedObject()` for new uploads, or an existing object to append. |
| `uploadPacked(options)` | `PackedUpload` for batching small files into shared slabs. |
| `download(object, options)` | Returns a `Download`. |
| `object(key)` | Fetch metadata for an object. |
| `pinObject(object)` / `deleteObject(key)` | Pin / delete. |
| `updateObjectMetadata(object)` | Push local metadata changes to the indexer. |
| `objectEvents(cursor, limit)` | Paginated object change feed. |
| `shareObject(object, validUntil)` / `sharedObject(url)` | Create / consume share URLs. |
| `hosts()` | List usable hosts. |
| `slab(id)` | Slab metadata. |
| `pruneSlabs()` | Unpin slabs no longer referenced by any object. |
| `account()` | Account info. |

### `AppKey`

`new AppKey(key)` — 32-byte `ArrayBuffer`. Get it via `sdk.appKey().export_()` and store securely (Keychain / Keystore).

`export_()` · `sign(message)` · `publicKey()` · `verifySignature(message, signature)`

### `PinnedObject`

`new PinnedObject()` for new uploads, `sdk.object(key)` to load one, or `PinnedObject.open(appKey, sealed)` to unseal one.

`id()` · `size()` · `encodedSize()` · `slabs()` · `metadata()` · `updateMetadata(bytes)` · `createdAt()` · `updatedAt()` · `seal(appKey)`

### `Download`

From `sdk.download()`. `read()` returns the next chunk; an empty `ArrayBuffer` signals EOF.

`read()` · `cancel()`

### `PackedUpload`

From `sdk.uploadPacked()`.

`add(reader)` · `finalize()` · `cancel()` · `remaining()` · `length()` · `slabs()`

### `Reader`

The callback interface passed to `upload` and `PackedUpload.add`. Implement `read(): Promise<ArrayBuffer>` — return chunks until you're done, then return an empty `ArrayBuffer`.

## License

MIT
