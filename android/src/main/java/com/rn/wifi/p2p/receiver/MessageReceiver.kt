package com.rn.wifi.p2p.receiver

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import java.io.InputStream
import java.io.InputStreamReader
import java.net.ServerSocket
import java.net.Socket
import java.nio.charset.Charset
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class MessageReceiver {

    private var executor: ExecutorService? = null
    @Volatile
    private var serverSocket: ServerSocket? = null
    @Volatile
    private var isRunning = false

    companion object {
        private const val TAG = "RnWifiP2P"
        private const val PORT = 8988
        private const val CHARSET = "UTF-8"
    }

    fun start(props: ReadableMap?, callback: Callback) {
        if (isRunning) {
            Log.w(TAG, "MessageReceiver already running")
            return
        }

        executor = Executors.newSingleThreadExecutor()

        executor?.execute {
            try {
                val returnMeta = props?.getBoolean("meta") ?: false

                serverSocket = ServerSocket(PORT)
                isRunning = true

                Log.i(TAG, "MessageReceiver: listening on port $PORT")

                while (isRunning) {
                    try {
                        val client: Socket = serverSocket!!.accept()
                        val fromAddress = client.inetAddress?.hostAddress ?: "unknown"
                        val message = readMessage(client.getInputStream())
                        client.close()

                        if (returnMeta) {
                            val map: WritableMap = Arguments.createMap()
                            map.putString("message", message)
                            map.putString("fromAddress", fromAddress)
                            callback.invoke(map)
                        } else {
                            callback.invoke(message)
                        }

                        Log.i(TAG, "MessageReceiver: message received")

                    } catch (e: Exception) {
                        if (isRunning) {
                            Log.e(TAG, "MessageReceiver connection error: ${e.message}", e)
                        } else {
                            Log.i(TAG, "MessageReceiver stopped during accept")
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "MessageReceiver startup error: ${e.message}", e)
            } finally {
                try {
                    serverSocket?.close()
                    Log.i(TAG, "MessageReceiver: socket closed")
                } catch (e: Exception) {
                    Log.e(TAG, "MessageReceiver socket close error", e)
                }
                executor?.shutdown()
                isRunning = false
            }
        }
    }

    fun stop() {
        isRunning = false
        try {
            serverSocket?.close()
        } catch (e: Exception) {
            Log.e(TAG, "MessageReceiver stop error", e)
        }
    }

    private fun readMessage(inputStream: InputStream): String {
        val reader = InputStreamReader(inputStream, Charset.forName(CHARSET))
        val buffer = CharArray(4096)
        val sb = StringBuilder()

        reader.use {
            var count: Int
            while (reader.read(buffer).also { count = it } > 0) {
                sb.append(buffer, 0, count)
            }
        }

        return sb.toString()
    }
}
