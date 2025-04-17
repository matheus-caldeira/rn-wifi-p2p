package com.rn.wifi.p2p

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.net.wifi.WpsInfo
import android.net.wifi.p2p.*
import android.os.Bundle
import android.os.ResultReceiver
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import java.io.File
import com.rn.wifi.p2p.core.*
import com.rn.wifi.p2p.receiver.*
import com.rn.wifi.p2p.sender.*

@ReactModule(name = RnWifiP2PModule.NAME)
class RnWifiP2PModule(reactContext: ReactApplicationContext) :
  NativeRnWifiP2PSpec(reactContext), WifiP2pManager.ConnectionInfoListener {

  companion object {
    const val NAME = "RnWifiP2P"
    private const val TAG = "RNWiFiP2P"
    private const val DEFAULT_PORT = 8988
  }

  private var manager: WifiP2pManager? = null
  private var channel: WifiP2pManager.Channel? = null
  private var connectionInfo: WifiP2pInfo? = null
  private var mapper = Mapper()
  private var eventReceiver: EventReceiver? = null
  private var messageReceiver: MessageReceiver? = null

  override fun getName() = NAME

  override fun onConnectionInfoAvailable(info: WifiP2pInfo?) {
    connectionInfo = info
  }

  override fun init(promise: Promise) {
    try {
      val activity = currentActivity ?: throw IllegalStateException("Main activity is null")

      if (manager != null || channel != null || eventReceiver != null) {
        Log.w(TAG, "Already initialized. Stopping previous instance.")
        stopInternal()
      }

      manager = activity.getSystemService(Context.WIFI_P2P_SERVICE) as WifiP2pManager
      channel = manager?.initialize(activity, activity.mainLooper, null)

      if (manager == null || channel == null) {
        promise.reject("INIT_FAILED", "WifiP2pManager not initialized.")
        return
      }

      val filter = IntentFilter().apply {
        addAction(WifiP2pManager.WIFI_P2P_PEERS_CHANGED_ACTION)
        addAction(WifiP2pManager.WIFI_P2P_CONNECTION_CHANGED_ACTION)
        addAction(WifiP2pManager.WIFI_P2P_THIS_DEVICE_CHANGED_ACTION)
      }

      eventReceiver = EventReceiver(manager!!, channel!!, reactApplicationContext, mapper)
      activity.registerReceiver(eventReceiver, filter)

      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("INIT_ERROR", e.message)
    }
  }

  override fun stop(promise: Promise) {
    try {
      stopInternal()
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("STOP_ERROR", e.message)
    }
  }

  private fun stopInternal() {
    val activity = currentActivity

    try {
      if (activity != null && eventReceiver != null) {
        activity.unregisterReceiver(eventReceiver)
        eventReceiver = null
      }
    } catch (e: Exception) {
      Log.w(TAG, "Error unregistering receiver: ${e.message}")
    }

    messageReceiver?.stop()
    messageReceiver = null
    connectionInfo = null
    channel = null
    manager = null
  }

  override fun setConfig(config: ReadableMap) {
    if (config.hasKey("notificationTitle")) {
      Config.notificationTitle = config.getString("notificationTitle") ?: Config.notificationTitle
    }
    if (config.hasKey("sendingMessageText")) {
      Config.sendingMessageText = config.getString("sendingMessageText") ?: Config.sendingMessageText
    }
    if (config.hasKey("channelName")) {
      Config.channelName = config.getString("channelName") ?: Config.channelName
    }
  }

  override fun getConfig(promise: Promise) {
    try {
      promise.resolve(Config.toWritableMap())
    } catch (e: Exception) {
      promise.reject("GET_CONFIG_ERROR", e.message)
    }
  }


  override fun discoverPeers(promise: Promise) {
    manager?.discoverPeers(channel, object : WifiP2pManager.ActionListener {
      override fun onSuccess() {
        promise.resolve(null)
      }

      override fun onFailure(reason: Int) {
        promise.reject("DISCOVER_FAILED", reason.toString())
      }
    }) ?: promise.reject("NO_MANAGER", "Manager not available")
  }

  override fun stopPeerDiscovery(promise: Promise) {
    manager?.stopPeerDiscovery(channel, object : WifiP2pManager.ActionListener {
      override fun onSuccess() {
        promise.resolve(null)
      }

      override fun onFailure(reason: Int) {
        promise.reject("STOP_DISCOVERY_FAILED", reason.toString())
      }
    }) ?: promise.reject("NO_MANAGER", "Manager not available")
  }

  override fun getAvailablePeersList(promise: Promise) {
    manager?.requestPeers(channel) { list ->
      promise.resolve(mapper.mapDevicesInfo(list))
    }
  }

  override fun connectWithConfig(config: ReadableMap, promise: Promise) {
    val cfg = WifiP2pConfig().apply {
      deviceAddress = config.getString("deviceAddress")
      wps.setup = WpsInfo.PBC
      if (config.hasKey("groupOwnerIntent")) {
        groupOwnerIntent = config.getDouble("groupOwnerIntent").toInt()
      }
    }

    manager?.connect(channel, cfg, object : WifiP2pManager.ActionListener {
      override fun onSuccess() {
        promise.resolve(null)
      }

      override fun onFailure(reason: Int) {
        promise.reject("CONNECT_FAILED", reason.toString())
      }
    }) ?: promise.reject("NO_MANAGER", "Manager not available")
  }

  override fun cancelConnect(promise: Promise) {
    manager?.cancelConnect(channel, object : WifiP2pManager.ActionListener {
      override fun onSuccess() {
        promise.resolve(null)
      }

      override fun onFailure(reason: Int) {
        promise.reject("CANCEL_FAILED", reason.toString())
      }
    }) ?: promise.reject("NO_MANAGER", "Manager not available")
  }

  override fun createGroup(promise: Promise) {
    manager?.createGroup(channel, object : WifiP2pManager.ActionListener {
      override fun onSuccess() {
        promise.resolve(null)
      }

      override fun onFailure(reason: Int) {
        promise.reject("GROUP_CREATE_FAILED", reason.toString())
      }
    }) ?: promise.reject("NO_MANAGER", "Manager not available")
  }

  override fun removeGroup(promise: Promise) {
    manager?.removeGroup(channel, object : WifiP2pManager.ActionListener {
      override fun onSuccess() {
        promise.resolve(null)
      }

      override fun onFailure(reason: Int) {
        promise.reject("GROUP_REMOVE_FAILED", reason.toString())
      }
    }) ?: promise.reject("NO_MANAGER", "Manager not available")
  }

  override fun getConnectionInfo(promise: Promise) {
    manager?.requestConnectionInfo(channel) {
      connectionInfo = it
      promise.resolve(mapper.mapConnectionInfo(it))
    }
  }

  override fun getGroupInfo(promise: Promise) {
    manager?.requestGroupInfo(channel) { group ->
      promise.resolve(group?.let { mapper.mapGroupInfo(it) })
    }
  }

  override fun sendFile(path: String, promise: Promise) {
    val address = connectionInfo?.groupOwnerAddress?.hostAddress
    if (address == null) {
      promise.reject("NO_CONNECTION", "Not connected to a group.")
      return
    }
    sendFileTo(path, address, promise)
  }

  override fun sendFileTo(path: String, address: String, promise: Promise) {
    val activity = currentActivity
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "Cannot start service: activity is null.")
      return
    }

    val uri = Uri.fromFile(File(path))
    val intent = Intent(activity, FileSender::class.java).apply {
      action = FileSender.ACTION_SEND_FILE
      putExtra(FileSender.EXTRAS_FILE_PATH, uri.toString())
      putExtra(FileSender.EXTRAS_ADDRESS, address)
      putExtra(FileSender.EXTRAS_PORT, DEFAULT_PORT)
      putExtra(FileSender.REQUEST_RECEIVER_EXTRA, object : ResultReceiver(null) {
        override fun onReceiveResult(code: Int, bundle: Bundle) {
          if (code == 0) {
            promise.resolve(mapper.mapSendFileResult(bundle))
          } else {
            promise.reject("SEND_ERROR", bundle.getString("error"))
          }
        }
      })
    }

    Log.i(TAG, "Starting service with intent: $intent")

    activity.startService(intent)
  }

  override fun receiveFile(
    folder: String,
    fileName: String,
    forceToScanGallery: Boolean,
    promise: Promise
  ) {
    val destination = "$folder/$fileName"
    manager?.requestConnectionInfo(channel) { info ->
      if (info.groupFormed) {
        FileReceiver(
          context = reactApplicationContext,
          destinationPath = destination,
          forceGalleryScan = forceToScanGallery,
          onComplete = { path -> promise.resolve(path) }
        ).start()
      } else {
        promise.reject("NO_GROUP", "Not in a group.")
      }
    }
  }

  override fun sendMessage(message: String, promise: Promise) {
    val address = connectionInfo?.groupOwnerAddress?.hostAddress
    if (address == null) {
      promise.reject("NO_CONNECTION", "Not connected to a group.")
      return
    }
    sendMessageTo(message, address, promise)
  }

  override fun sendMessageTo(message: String, address: String, promise: Promise) {
    val context = reactApplicationContext

    if (message.isBlank() || address.isBlank()) {
      promise.reject("INVALID_INPUT", "Message or address is empty.")
      return
    }

    val intent = Intent(context, MessageSender::class.java).apply {
      action = MessageSender.ACTION_SEND_MESSAGE
      putExtra(MessageSender.EXTRAS_DATA, message)
      putExtra(MessageSender.EXTRAS_ADDRESS, address)
      putExtra(MessageSender.EXTRAS_PORT, DEFAULT_PORT)
      putExtra(MessageSender.REQUEST_RECEIVER_EXTRA, object : ResultReceiver(null) {
        override fun onReceiveResult(code: Int, bundle: Bundle) {
          if (code == 0) {
            promise.resolve(mapper.mapSendMessageResult(bundle))
          } else {
            val error = bundle.getString("error") ?: "Unknown error"
            promise.reject("SEND_ERROR", error)
          }
        }
      })
    }

    Log.i(TAG, "Dispatching MessageSenderService with intent: $intent")
    intent.extras?.keySet()?.forEach { key ->
      Log.i(TAG, "Intent extra: $key = ${intent.extras?.get(key)}")
    }

    MessageSender.enqueueWork(context, intent)
  }

  override fun startReceivingMessage(props: ReadableMap?, promise: Promise) {
    manager?.requestConnectionInfo(channel) { info ->
      if (info.groupFormed) {
        if (messageReceiver == null) {
          messageReceiver = MessageReceiver(
            callback = { params ->
              Log.i(TAG, "Callback recebida: ${params.toString()}")
              eventReceiver?.emit(Event.MESSAGE_RECEIVED, params)
            }
          )
        }
        messageReceiver?.start(props)
        promise.resolve(null)
      } else {
        promise.reject("NOT_IN_GROUP", "Not in a group.")
      }
    }
  }

  override fun stopReceivingMessage() {
    messageReceiver?.stop()
  }
}
