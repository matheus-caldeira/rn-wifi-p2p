import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Device {
  deviceAddress: string;
  deviceName: string;
  isGroupOwner: boolean;
  primaryDeviceType: string | null;
  secondaryDeviceType: string | null;
  status: number;
}

export interface ConnectionArgs {
  deviceAddress: string;
  groupOwnerIntent?: number;
}

export interface GroupInfo {
  interface: string;
  networkName: string;
  passphrase: string;
  owner: {
    deviceAddress: string;
    deviceName: string;
    primaryDeviceType: string | null;
    secondaryDeviceType: string | null;
    status: number;
  } | null;
}

export interface WifiP2pInfo {
  groupOwnerAddress: {
    hostAddress: string;
    isLoopbackAddress: boolean;
  } | null;
  groupFormed: boolean;
  isGroupOwner: boolean;
}

export interface FileTransferResult {
  file: string;
  time: number;
}

export interface MessageTransferResult {
  message: string;
  time: number;
}

export interface Spec extends TurboModule {
  // Inicialização
  init(): Promise<boolean>;
  stop(): Promise<boolean>;

  // Descoberta e conexão
  discoverPeers(): Promise<void>;
  stopPeerDiscovery(): Promise<void>;
  getAvailablePeersList(): Promise<{ devices: Device[] }>;
  connectWithConfig(config: ConnectionArgs): Promise<void>;
  cancelConnect(): Promise<void>;
  createGroup(): Promise<void>;
  removeGroup(): Promise<void>;

  // Informações
  getConnectionInfo(): Promise<WifiP2pInfo>;
  getGroupInfo(): Promise<GroupInfo | null>;

  // Arquivos
  sendFile(path: string): Promise<FileTransferResult>;
  sendFileTo(path: string, address: string): Promise<FileTransferResult>;
  receiveFile(
    folder: string,
    fileName: string,
    forceToScanGallery: boolean
  ): Promise<string>;

  // Mensagens
  sendMessage(message: string): Promise<MessageTransferResult>;
  sendMessageTo(
    message: string,
    address: string
  ): Promise<MessageTransferResult>;
  receiveMessage(
    props: { meta: boolean },
    callback: (message: unknown) => void
  ): void;
  stopReceivingMessage(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RnWifiP2P');
