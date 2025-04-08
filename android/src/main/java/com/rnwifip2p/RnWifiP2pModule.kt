package com.rnwifip2p

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = RnWifiP2pModule.NAME)
class RnWifiP2pModule(reactContext: ReactApplicationContext) :
  NativeRnWifiP2pSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = "RnWifiP2p"
  }
}
