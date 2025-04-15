# rn-wifi-p2p

[![CI](https://github.com/matheus-caldeira/rn-wifi-p2p/actions/workflows/ci.yml/badge.svg)](https://github.com/matheus-caldeira/rn-wifi-p2p/actions/workflows/ci.yml)

**React Native module for peer-to-peer communication over Wi-Fi Direct on Android.**

This library enables Android devices to discover and connect to each other directly without an internet connection, ideal for offline file transfer, messaging, and collaborative apps.

> ⚠️ This library is **Android-only** and requires runtime permissions to operate correctly.

---

## 📦 Installation

Install the package using [Yarn](https://yarnpkg.com):

```bash
yarn add rn-wifi-p2p
```

---

## ⚙️ Android Configuration

Add the following permissions to your `AndroidManifest.xml`:

```xml
<!-- Required to send/receive files from external storage -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- Required to scan and connect to nearby peers on Android 13+ -->
<uses-permission
    android:name="android.permission.NEARBY_WIFI_DEVICES"
    android:usesPermissionFlags="neverForLocation" />

<!-- Required for Wi-Fi P2P discovery -->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission
    android:name="android.permission.ACCESS_FINE_LOCATION"
    android:required="true"
    android:maxSdkVersion="32" />
```

> ✅ If your app **requires precise location**, remove the `maxSdkVersion` attribute from `ACCESS_FINE_LOCATION`.

> 🔐 These permissions must also be **requested at runtime** in your JavaScript code, especially from Android 6+ (API 23).

---

## 🧪 Example App

A complete example demonstrating peer discovery, connection, file sharing, and messaging is available in the [`example/`](./example) directory.

To learn how to run it locally, refer to the [CONTRIBUTING.md](./CONTRIBUTING.md) guide.

---

## 📚 API Overview

The following capabilities are supported:

- 📡 Peer discovery using Wi-Fi Direct
- 🔗 Device-to-device connection management
- 📁 File transfer between devices
- 💬 Message exchange using native sockets
- 👥 Group creation and teardown
- 🔄 Subscriptions to device, peer, and connection changes

> Detailed API documentation is available in the source code and TypeScript typings.

---

## 🤝 Contributing

To contribute to this module or run the example app locally, see [CONTRIBUTING.md](./CONTRIBUTING.md) for setup and development guidelines.

---

## 📄 License

[MIT](./LICENSE)

---

Created with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
