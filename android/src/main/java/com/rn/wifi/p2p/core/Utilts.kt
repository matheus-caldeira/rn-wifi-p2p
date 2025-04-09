package com.rn.wifi.p2p.core

import android.util.Log
import java.io.InputStream
import java.io.OutputStream
import java.nio.charset.Charset

object Utils {
  const val CHARSET = "UTF-8"
  private const val TAG = "RnWifiP2P"

  fun copyBytes(inputStream: InputStream?, outputStream: OutputStream?): Boolean {
    if (inputStream == null || outputStream == null) {
      Log.e(TAG, "copyBytes error: input or output stream is null")
      return false
    }

    return try {
      inputStream.use { input ->
        outputStream.use { output ->
          val buffer = ByteArray(1024)
          var bytesRead: Int
          while (input.read(buffer).also { bytesRead = it } != -1) {
            output.write(buffer, 0, bytesRead)
          }
          output.flush()
        }
      }
      true
    } catch (e: Exception) {
      Log.e(TAG, "copyBytes error", e)
      false
    }
  }

  fun inputStreamToString(inputStream: InputStream): String {
    return inputStream.bufferedReader(Charset.forName(CHARSET)).use { it.readText() }
  }
}
