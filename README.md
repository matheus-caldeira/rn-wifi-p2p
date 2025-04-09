# rn-wifi-p2p

React Native module for Android P2P communication using Wi-Fi Direct.

## Installation

```sh
npm install rn-wifi-p2p
```

### Android

To use **Wi-Fi Direct** on Android, the following permissions must be added to your app’s `AndroidManifest.xml`:

```xml
      <!-- If your app targets Android 13 (API level 33)
         or higher, you must declare the NEARBY_WIFI_DEVICES permission. -->
<uses-permission
      android:name="android.permission.NEARBY_WIFI_DEVICES"
      android:usesPermissionFlags="neverForLocation" />
      <!-- If your app derives location information from Wi-Fi APIs,
          don't include the "usesPermissionFlags" attribute. -->
<uses-permission
      android:required="true"
      android:name="android.permission.ACCESS_FINE_LOCATION"
      android:maxSdkVersion="32" />
    <!-- If any feature in your app relies on precise location information,
          don't include the "maxSdkVersion" attribute.  -->
```

## Usage

```js
import { multiply } from 'rn-wifi-p2p';

// ...

const result = multiply(3, 7);
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
