package com.rn.wifi.p2p.sender

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.*
import android.util.Log
import androidx.core.app.NotificationCompat
import com.rn.wifi.p2p.R
import com.rn.wifi.p2p.core.Config
import com.rn.wifi.p2p.core.Utils
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.ByteArrayInputStream
import java.io.IOException
import java.net.InetSocketAddress
import java.net.Socket
import java.nio.charset.StandardCharsets

class MessageSender : Service() {

  companion object {
    private const val TAG = "RnWifiP2P"
    private const val CHANNEL_ID = "MessageSenderChannel"
    private const val NOTIFICATION_ID = 101
    private const val SOCKET_TIMEOUT = 5000

    const val ACTION_SEND_MESSAGE = "com.rn.wifi.p2p.SEND_MESSAGE"
    const val EXTRAS_DATA = "message"
    const val EXTRAS_ADDRESS = "go_host"
    const val EXTRAS_PORT = "go_port"
    const val REQUEST_RECEIVER_EXTRA = "REQUEST_RECEIVER_EXTRA"

    fun enqueueWork(context: Context, intent: Intent) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }
  }

  override fun onCreate() {
    super.onCreate()
    createNotificationChannel()
    val notification = buildNotification(Config.sendingMessageText)
    startForeground(NOTIFICATION_ID, notification)
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    CoroutineScope(Dispatchers.IO).launch {
      handleMessageIntent(intent)
      stopSelf(startId)
    }
    return START_NOT_STICKY
  }

  private fun handleMessageIntent(intent: Intent?) {
    if (intent?.action != ACTION_SEND_MESSAGE) {
      Log.w(TAG, "Unknown action: ${intent?.action}")
      return
    }

    val message = intent.getStringExtra(EXTRAS_DATA)
    val host = intent.getStringExtra(EXTRAS_ADDRESS)
    val port = intent.getIntExtra(EXTRAS_PORT, 8988)
    val receiver = intent.getParcelableExtra<ResultReceiver>(REQUEST_RECEIVER_EXTRA)
    val bundle = Bundle()

    if (message.isNullOrEmpty() || host.isNullOrEmpty()) {
      bundle.putString("error", "Invalid message or host")
      receiver?.send(1, bundle)
      return
    }

    val startTime = System.currentTimeMillis()
    val socket = Socket()

    try {
      Log.i(TAG, "Connecting to $host:$port to send message...")
      socket.connect(InetSocketAddress(host, port), SOCKET_TIMEOUT)

      val stream = socket.getOutputStream()
      val inputStream = ByteArrayInputStream(message.toByteArray(StandardCharsets.UTF_8))
      Utils.copyBytes(inputStream, stream)

      val duration = System.currentTimeMillis() - startTime
      bundle.putLong("time", duration)
      bundle.putString("message", message)
      receiver?.send(0, bundle)

      Log.i(TAG, "Message sent in ${duration}ms")

    } catch (e: IOException) {
      Log.e(TAG, "Error sending message", e)
      bundle.putString("error", e.message)
      receiver?.send(1, bundle)
    } finally {
      try {
        socket.close()
      } catch (e: IOException) {
        Log.e(TAG, "Error closing socket", e)
      }
    }
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val serviceChannel = NotificationChannel(
        CHANNEL_ID,
        Config.channelName,
        NotificationManager.IMPORTANCE_LOW
      )
      val manager = getSystemService(NotificationManager::class.java)
      manager?.createNotificationChannel(serviceChannel)
    }
  }

  private fun buildNotification(content: String): Notification {
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle(Config.notificationTitle)
      .setContentText(content)
      .setSmallIcon(R.drawable.ic_notification)
      .build()
  }
}
