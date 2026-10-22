---
default: patch
---

#### Publish the iOS build and support React Native 0.88

0.16.0 was never published to npm because its iOS device build failed to link. This is the first release on npm with the Sia SDK v0.13.2 update and the breaking changes listed under 0.16.0.

The package is built and tested against React Native 0.88 and React 19.3, with Xcode 26. The example app follows the React Native 0.88 template, including the scene delegate that apps built with the iOS 27 SDK need to launch.
