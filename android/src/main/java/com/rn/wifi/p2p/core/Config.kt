package com.rn.wifi.p2p.core

import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap

object Config {
  var notificationTitle: String = "Wi-Fi Direct"
  var sendingMessageText: String = "Enviando mensagem..."
  var channelName: String = "Mensagens Wi-Fi P2P"

  fun toWritableMap(): WritableMap {
    return WritableNativeMap().apply {
      putString("notificationTitle", notificationTitle)
      putString("sendingMessageText", sendingMessageText)
      putString("channelName", channelName)
    }
  }
}
