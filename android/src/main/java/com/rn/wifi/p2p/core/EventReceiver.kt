package com.rn.wifi.p2p.core

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.wifi.p2p.*
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

import com.rn.wifi.p2p.core.Mapper

class EventReceiver(
    private val manager: WifiP2pManager,
    private val channel: WifiP2pManager.Channel,
    private val reactContext: ReactApplicationContext,
    private val mapper: Mapper = Mapper()
) : BroadcastReceiver() {

    companion object {
        private const val TAG = "RnWifiP2P"
        private const val MODULE = "RN_WIFI_P2P"
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        val action = intent?.action ?: return

        when (action) {
            WifiP2pManager.WIFI_P2P_PEERS_CHANGED_ACTION -> {
                manager.requestPeers(channel) { peers ->
                    val data = mapper.mapDevicesInfo(peers)
                    emit(Event.PEERS_UPDATED, data)
                }
            }

            WifiP2pManager.WIFI_P2P_CONNECTION_CHANGED_ACTION -> {
                manager.requestConnectionInfo(channel) { info ->
                    val data = mapper.mapConnectionInfo(info)
                    emit(Event.CONNECTION_INFO_UPDATED, data)
                }
            }

            WifiP2pManager.WIFI_P2P_THIS_DEVICE_CHANGED_ACTION -> {
                manager.requestGroupInfo(channel) { group ->
                    group?.let {
                        val data = mapper.mapGroupInfo(it)
                        emit(Event.THIS_DEVICE_CHANGED_ACTION, data)
                    }
                }
            }

            else -> Log.d(TAG, "Unhandled action: $action")
        }
    }

    fun emit(event: Event, params: WritableMap?) {
      val fullEventName = "${MODULE}_${event.eventName}"
      Log.i(TAG, "calling event $fullEventName")
      try {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(fullEventName, params)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to emit event $fullEventName: ${e.message}", e)
        }
    }
}
