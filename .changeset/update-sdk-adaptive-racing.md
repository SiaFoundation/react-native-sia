---
'react-native-sia': minor
---

Update the underlying Sia SDK with faster, more reliable transfers:

- Faster large downloads: requests now ramp up to reduce round trips, and slow hosts are routed around by fetching extra shards in parallel to cut tail latency.
- Smarter host selection: hosts are now ranked by their current upload/download load, and fallback hosts are only used when a transfer is genuinely lagging, so they no longer slow down higher-priority work.
- More reliable under heavy parallel load: fixed crashes that could occur at high concurrency and improved connection cleanup.
- `DownloadOptions.maxInflight` now accepts values above 255 (the field is still a `number` in TypeScript, so existing code is unaffected).
