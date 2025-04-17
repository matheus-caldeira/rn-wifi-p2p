package com.rn.wifi.p2p.core

import android.net.wifi.p2p.*
import android.os.Bundle
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

class Mapper {

    fun mapDeviceInfo(device: WifiP2pDevice): WritableMap {
        val map = Arguments.createMap()
        map.putString("deviceName", device.deviceName)
        map.putString("deviceAddress", device.deviceAddress)
        map.putString("primaryDeviceType", device.primaryDeviceType)
        map.putString("secondaryDeviceType", device.secondaryDeviceType)
        map.putBoolean("isGroupOwner", device.isGroupOwner)
        map.putInt("status", device.status)
        return map
    }

    fun mapDeviceList(deviceList: WifiP2pDeviceList): WritableArray {
        val array = Arguments.createArray()
        for (device in deviceList.deviceList) {
            array.pushMap(mapDeviceInfo(device))
        }
        return array
    }

    fun mapCollectionDevice(deviceCollection: Collection<WifiP2pDevice>): WritableArray {
      val array = Arguments.createArray()
      for (device in deviceCollection) {
        array.pushMap(mapDeviceInfo(device))
      }
      return array
    }

    fun mapDevicesInfo(deviceList: WifiP2pDeviceList): WritableMap {
        val map = Arguments.createMap()
        map.putArray("devices", mapDeviceList(deviceList))
        return map
    }

    fun mapConnectionInfo(info: WifiP2pInfo): WritableMap {
        val map = Arguments.createMap()

        if (info.groupOwnerAddress != null) {
            val ownerMap = Arguments.createMap()
            ownerMap.putString("hostAddress", info.groupOwnerAddress.hostAddress)
            ownerMap.putBoolean("isLoopbackAddress", info.groupOwnerAddress.isLoopbackAddress)
            map.putMap("groupOwnerAddress", ownerMap)
        } else {
            map.putNull("groupOwnerAddress")
        }

        map.putBoolean("groupFormed", info.groupFormed)
        map.putBoolean("isGroupOwner", info.isGroupOwner)

        return map
    }

    fun mapGroupInfo(group: WifiP2pGroup): WritableMap {
        val map = Arguments.createMap()
        map.putString("interface", group.`interface`)
        map.putString("networkName", group.networkName)
        map.putString("passphrase", group.passphrase)
        map.putArray("clientList", mapCollectionDevice(group.clientList))

        val owner = group.owner
        if (owner != null) {
            map.putMap("owner", mapDeviceInfo(owner))
        } else {
            map.putNull("owner")
        }

        return map
    }

    fun mapSendFileResult(bundle: Bundle): WritableMap {
        val map = Arguments.createMap()
        map.putDouble("time", bundle.getLong("time").toDouble())
        map.putString("file", bundle.getString("file"))
        return map
    }

    fun mapSendMessageResult(bundle: Bundle): WritableMap {
        val map = Arguments.createMap()
        map.putDouble("time", bundle.getLong("time").toDouble())
        map.putString("message", bundle.getString("message"))
        return map
    }
}
