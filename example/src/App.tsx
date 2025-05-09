import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Button,
  PermissionsAndroid,
  TextInput,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  initialize,
  setConfig,
  connect,
  stop,
  removeAllSubscriptions,
  subscribeOnThisDeviceChanged,
  subscribeOnPeersUpdates,
  subscribeOnConnectionInfoUpdates,
  subscribeOnMessageReceived,
  type Device,
  cancelConnect,
  createGroup,
  removeGroup,
  startDiscoveringPeers,
  stopDiscoveringPeers,
  getAvailablePeers,
  getConnectionInfo,
  sendFile,
  receiveFile,
  sendMessage,
  startReceivingMessage,
  stopReceivingMessage,
  getGroupInfo,
} from 'rn-wifi-p2p';

const App = () => {
  const [message, setMessage] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [peers, setPeers] = useState<Device[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const initializedRef = useRef(false);

  const requestPermissions = async () => {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    // if (results !== 'granted') {
    //   Alert.alert(
    //     'Permissões necessárias',
    //     'Por favor, aceite a permissão de localização.'
    //   );
    //   return;
    // }

    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES
    );

    // if (results !== 'granted') {
    //   Alert.alert(
    //     'Permissões necessárias',
    //     'Por favor, aceite a permissão de wifi.'
    //   );
    //   return;
    // }
  };

  const appendLog = (text: string) => {
    const newLog = `[${new Date().toLocaleTimeString()}] ${text}`;
    console.log(newLog);
    setLog((prev) => [newLog, ...prev]);
  };

  useEffect(() => {
    (async () => {
      await requestPermissions();

      if (!initializedRef.current) {
        try {
          await initialize();
          initializedRef.current = true;

          setConfig({
            notificationTitle: 'Change this title',
            sendingMessageText: 'Change this message',
            channelName: 'channel-name',
          });

          subscribeOnThisDeviceChanged((data) => {
            console.log('This device changed:', data);
          });
          subscribeOnPeersUpdates((data) => {
            console.log('Peers updated:', data);
            setPeers(data.devices);
          });
          subscribeOnConnectionInfoUpdates((data) => {
            console.log('Connection info updated:', data);
          });
          subscribeOnMessageReceived((data) => {
            console.log('Message received:', data);
            appendLog(`receivingMessage: ${JSON.stringify(data)}`);
          });
          appendLog('Inicializado com sucesso!');
        } catch (e) {
          console.warn('Falha ao inicializar:', e);
        }
      }
    })();

    return () => {
      stop();
      removeAllSubscriptions();
    };
  }, []);

  const connectToFirstDevice = async () => {
    try {
      if (!device) {
        appendLog('Não há dispositivos disponíveis para conectar.');
        return;
      }

      await connect(device.deviceAddress);
    } catch (err) {
      console.warn('connectToFirstDevice', err);
      appendLog(`connectToFirstDevice err: ${err}`);
    }
  };
  const onCancelConnect = async () => {
    try {
      await cancelConnect();
    } catch (err) {
      console.warn('onCancelConnect', err);
      appendLog(`onCancelConnect err: ${err}`);
    }
  };
  const onCreateGroup = async () => {
    try {
      await createGroup();
    } catch (err) {
      console.warn('onCreateGroup', err);
      appendLog(`onCreateGroup err: ${err}`);
    }
  };
  const onRemoveGroup = async () => {
    try {
      await removeGroup();
    } catch (err) {
      console.warn('onRemoveGroup', err);
      appendLog(`onRemoveGroup err: ${err}`);
    }
  };
  const onStartInvestigate = async () => {
    try {
      await startDiscoveringPeers();
      appendLog(`onStartInvestigate started`);
    } catch (err) {
      console.warn('onStartInvestigate', err);
      appendLog(`onStartInvestigate err: ${err}`);
    }
  };
  const onStopInvestigation = async () => {
    try {
      await stopDiscoveringPeers();
    } catch (err) {
      console.warn('onStopInvestigation', err);
      appendLog(`onStopInvestigation err: ${err}`);
    }
  };
  const onGetAvailableDevices = async () => {
    try {
      const { devices } = await getAvailablePeers();
      appendLog(`onGetAvailableDevices devices: ${JSON.stringify(devices)}`);
      setPeers(devices);
    } catch (err) {
      console.warn('onGetAvailableDevices', err);
      appendLog(`onGetAvailableDevices err: ${err}`);
    }
  };
  const onGetConnectionInfo = async () => {
    try {
      const result = await getConnectionInfo();
      appendLog(
        `onGetConnectionInfo connectionInfo: ${JSON.stringify(result)}`
      );
    } catch (err) {
      console.warn('onGetConnectionInfo', err);
      appendLog(`onGetConnectionInfo err: ${err}`);
    }
  };
  const onGetGroupInfo = async () => {
    try {
      const result = await getGroupInfo();
      appendLog(`onGetGroupInfo groupInfo: ${JSON.stringify(result || {})}`);
    } catch (err) {
      console.warn('onGetGroupInfo', err);
      appendLog(`onGetGroupInfo err: ${err}`);
    }
  };
  const onSendFile = async () => {
    try {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      // change this to your file path
      const filePath = '/storage/emulated/0/Download/teste.txt';

      const result = await sendFile(filePath);

      appendLog(`onSendFile result: ${JSON.stringify(result)}`);
    } catch (err) {
      console.warn('onSendFile', err);
      appendLog(`onSendFile err: ${err}`);
    }
  };
  const onReceiveFile = async () => {
    try {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      const fileName = `test_${Date.now()}.txt`;
      const filePath = '/storage/emulated/0/Download/';

      const result = await receiveFile(filePath, fileName);

      appendLog(`onReceiveFile file: ${filePath} ${fileName}`);
      appendLog(`onReceiveFile result: ${JSON.stringify(result)}`);
    } catch (err) {
      console.warn('onReceiveFile', err);
      appendLog(`onReceiveFile err: ${err}`);
    }
  };
  const onSendMessage = async () => {
    try {
      const result = await sendMessage(
        JSON.stringify({
          text: message,
          date: Date.now(),
        })
      );
      appendLog(`onSendMessage result: ${JSON.stringify(result)}`);
    } catch (err) {
      console.warn('onSendMessage', err);
      appendLog(`onSendMessage err: ${err}`);
    }
  };
  const onstartReceivingMessage = async () => {
    try {
      startReceivingMessage<{ text: string; date: number }>(
        { meta: true },
        ({ message: { date, text } }) => {
          appendLog(`onstartReceivingMessage message: ${date} -  ${text}`);
        },
        { useJson: true }
      );
    } catch (err) {
      console.warn('onstartReceivingMessage', err);
      appendLog(`onstartReceivingMessage err: ${err}`);
    }
  };

  const onStopstartReceivingMessage = async () => {
    try {
      await stopReceivingMessage();
    } catch (err) {
      console.warn('onStopstartReceivingMessage', err);
      appendLog(`onStopstartReceivingMessage err: ${err}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Button title="Conectar" onPress={connectToFirstDevice} />
          <Button title="Cancelar conexão" onPress={onCancelConnect} />
          <Button title="Criar grupo" onPress={onCreateGroup} />
          <Button title="Remover grupo" onPress={onRemoveGroup} />
          <Button title="Procurar dispostivos" onPress={onStartInvestigate} />
          <Button title="Parar busca" onPress={onStopInvestigation} />
          <Button title="Listar dispostivos" onPress={onGetAvailableDevices} />
          <Button
            title="Listar informações de conexão"
            onPress={onGetConnectionInfo}
          />
          <Button
            title="Listar informações do grupo"
            onPress={onGetGroupInfo}
          />
          <Button title="Enviar arquivo" onPress={onSendFile} />
          <Button title="Receber arquivo" onPress={onReceiveFile} />
          <Button title="Receber mensagem" onPress={onstartReceivingMessage} />
          <Button
            title="Parar de receber mensagem"
            onPress={onStopstartReceivingMessage}
          />
        </View>

        <View style={styles.section}>
          <Text>Peers:</Text>
          {peers.map((item) => (
            <Button
              key={item.deviceAddress}
              title={`${item.deviceName} - ${item.deviceAddress}`}
              color={
                device?.deviceAddress === item.deviceAddress
                  ? 'black'
                  : undefined
              }
              onPress={() =>
                setDevice((old) =>
                  old?.deviceAddress === item.deviceAddress ? null : item
                )
              }
            />
          ))}
          <TextInput
            style={styles.input}
            placeholder="Mensagem"
            value={message}
            onChangeText={setMessage}
          />
          <Button title="Enviar Mensagem" onPress={onSendMessage} />
        </View>
      </ScrollView>
      <View style={styles.logSection}>
        <Text style={styles.logTitle}>Log:</Text>
        <FlatList
          data={log}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <Text style={styles.logLine}>{item}</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  scrollView: {
    height: '70%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  section: {
    marginVertical: 12,
    gap: 8,
  },
  input: {
    borderColor: '#aaa',
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
  },
  logSection: {
    flex: 1,
    marginTop: 16,
    backgroundColor: '#000',
  },
  logTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
  },
  logLine: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});

export default App;
