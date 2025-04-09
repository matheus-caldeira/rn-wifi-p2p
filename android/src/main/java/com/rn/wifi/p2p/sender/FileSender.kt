package com.rn.wifi.p2p.sender

import android.app.IntentService
import android.content.ContentResolver
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.ResultReceiver
import android.util.Log
import java.io.*
import java.net.InetSocketAddress
import java.net.Socket

import com.rn.wifi.p2p.core.Utils

class FileSender : IntentService("FileSender") {

  companion object {
      const val TAG = "RnWifiP2P"
      const val SOCKET_TIMEOUT = 5000
      const val ACTION_SEND_FILE = "com.rn.wifi.p2p.SEND_FILE"
      const val EXTRAS_FILE_PATH = "file_url"
      const val EXTRAS_ADDRESS = "go_host"
      const val EXTRAS_PORT = "go_port"
      const val REQUEST_RECEIVER_EXTRA = "REQUEST_RECEIVER_EXTRA"
  }

  override fun onHandleIntent(intent: Intent?) {
      if (intent?.action != ACTION_SEND_FILE) return

      val fileUri = intent.getStringExtra(EXTRAS_FILE_PATH)
      val host = intent.getStringExtra(EXTRAS_ADDRESS)
      val port = intent.getIntExtra(EXTRAS_PORT, 8988)
      val receiver = intent.getParcelableExtra<ResultReceiver>(REQUEST_RECEIVER_EXTRA)
      val bundle = Bundle()
      val startTime = System.currentTimeMillis()

      if (fileUri == null || host == null) {
          Log.e(TAG, "Missing required intent extras")
          bundle.putString("error", "Missing fileUri or host")
          receiver?.send(1, bundle)
          return
      }

      val socket = Socket()

      try {
          Log.i(TAG, "Connecting to $host:$port")
          socket.bind(null)
          socket.connect(InetSocketAddress(host, port), SOCKET_TIMEOUT)

          val stream: OutputStream = socket.getOutputStream()
          val cr: ContentResolver = applicationContext.contentResolver
          val inputStream: InputStream? = cr.openInputStream(Uri.parse(fileUri))

          if (inputStream == null) {
              Log.e(TAG, "InputStream is null for URI: $fileUri")
              bundle.putString("error", "Failed to open file input stream.")
              receiver?.send(1, bundle)
              return
          }

          Utils.copyBytes(inputStream, stream)

          val duration = System.currentTimeMillis() - startTime
          bundle.putLong("time", duration)
          bundle.putString("file", fileUri)
          receiver?.send(0, bundle)

          Log.i(TAG, "File sent successfully to $host:$port in ${duration}ms")

      } catch (e: IOException) {
          Log.e(TAG, "FileSender error: ${e.message}", e)
          bundle.putString("error", e.message)
          receiver?.send(1, bundle)
      } finally {
          try {
              if (socket.isConnected) socket.close()
          } catch (e: IOException) {
              Log.e(TAG, "Error closing socket", e)
          }
      }
  }
}
