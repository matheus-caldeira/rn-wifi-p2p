package com.rn.wifi.p2p.receiver

import android.content.Context
import android.media.MediaScannerConnection
import android.os.Environment
import android.util.Log
import java.io.*
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.Executors

class FileReceiver(
    private val context: Context,
    private val destinationPath: String,
    private val forceGalleryScan: Boolean = false,
    private val onComplete: (String) -> Unit,
    private val onAfterSave: () -> Unit = {}
) {

    private val executor = Executors.newSingleThreadExecutor()

    companion object {
        private const val TAG = "RnWifiP2P"
        private const val PORT = 8988
    }

    fun start() {
        executor.execute {
            var serverSocket: ServerSocket? = null
            try {
                Log.i(TAG, "FileReceiver: opening server socket...")
                serverSocket = ServerSocket(PORT)

                val client: Socket = serverSocket.accept()
                Log.i(TAG, "FileReceiver: client connected")

                val file = File(destinationPath)
                file.parentFile?.mkdirs()
                file.createNewFile()

                val inputStream = client.getInputStream()
                val outputStream = FileOutputStream(file)

                inputStream.use { input ->
                    outputStream.use { output ->
                        input.copyTo(output)
                    }
                }

                Log.i(TAG, "FileReceiver: file saved to $destinationPath")

                if (forceGalleryScan) {
                  scanFile(file)
                }

                onAfterSave()
                onComplete(destinationPath)
                Log.i(TAG, "FileReceiver: file transfer complete")
            } catch (e: IOException) {
                Log.e(TAG, "FileReceiver error: ${e.message}", e)
            } finally {
                try {
                    serverSocket?.close()
                    Log.i(TAG, "FileReceiver: socket closed")
                } catch (e: IOException) {
                    Log.e(TAG, "FileReceiver close error", e)
                }
                executor.shutdown()
            }
        }
    }

    private fun scanFile(file: File) {
        MediaScannerConnection.scanFile(
            context,
            arrayOf(file.absolutePath),
            null,
            null
        )
    }
}
