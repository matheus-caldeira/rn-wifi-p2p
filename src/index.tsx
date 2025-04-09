import { DeviceEventEmitter, type EmitterSubscription } from 'react-native';
import type {
  Device,
  WifiP2pInfo,
  GroupInfo,
  ConnectionArgs,
  FileTransferResult,
  MessageTransferResult,
} from './NativeRnWifiP2P';

export type {
  Device,
  WifiP2pInfo,
  GroupInfo,
  ConnectionArgs,
  FileTransferResult,
  MessageTransferResult,
};

import NativeRnWifiP2P from './NativeRnWifiP2P';

// ────────────────
// Error Codes
// ────────────────

const ERROR = 0;
const P2P_UNSUPPORTED = 1;
const BUSY = 2;

const ERROR_MESSAGES: Record<number, string> = {
  [ERROR]: 'Operation failed due to an internal error.',
  [P2P_UNSUPPORTED]:
    'Operation failed because p2p is unsupported on the device.',
  [BUSY]:
    'Operation failed because the framework is busy and unable to service the request.',
};

function getError(reasonCode: number) {
  return {
    code: reasonCode,
    message: ERROR_MESSAGES[reasonCode] ?? 'Unknown error.',
  };
}

// ────────────────
// Events
// ────────────────

export const PEERS_UPDATED_ACTION = 'PEERS_UPDATED';
export const CONNECTION_INFO_UPDATED_ACTION = 'CONNECTION_INFO_UPDATED';
export const THIS_DEVICE_CHANGED_ACTION = 'THIS_DEVICE_CHANGED_ACTION';

const MODULE_NAME = 'RN_WIFI_P2P';

// ────────────────
// Event Subscriptions
// ────────────────

type SubscriptionCallback = (...args: any[]) => void;

const subscriptionsMap = new Map<string, Set<EmitterSubscription>>();

export const subscribeOnEvent = (
  event: string,
  callback: SubscriptionCallback
): EmitterSubscription => {
  const fullEvent = `${MODULE_NAME}:${event}`;
  const subscription = DeviceEventEmitter.addListener(fullEvent, callback);

  if (!subscriptionsMap.has(fullEvent)) {
    subscriptionsMap.set(fullEvent, new Set());
  }

  subscriptionsMap.get(fullEvent)?.add(subscription);

  return subscription;
};

export const removeAllListenersFromEvent = (event: string): void => {
  const fullEvent = `${MODULE_NAME}:${event}`;
  const subs = subscriptionsMap.get(fullEvent);

  if (!subs) return;

  for (const sub of subs) {
    sub.remove();
  }

  subscriptionsMap.delete(fullEvent);
};

export const removeAllSubscriptions = () => {
  subscriptionsMap.forEach((subs) => {
    subs.forEach((sub) => sub.remove());
  });
  subscriptionsMap.clear();
};

export const subscribeOnThisDeviceChanged = (
  callback: (data: GroupInfo) => void
): EmitterSubscription =>
  subscribeOnEvent(THIS_DEVICE_CHANGED_ACTION, callback);

export const removeAllListenersFromThisDeviceChanged = (): void =>
  removeAllListenersFromEvent(THIS_DEVICE_CHANGED_ACTION);

export const subscribeOnPeersUpdates = (
  callback: (data: { devices: Device[] }) => void
): EmitterSubscription => subscribeOnEvent(PEERS_UPDATED_ACTION, callback);

export const removeAllListenersFromPeersUpdates = (): void =>
  removeAllListenersFromEvent(PEERS_UPDATED_ACTION);

export const subscribeOnConnectionInfoUpdates = (
  callback: (data: WifiP2pInfo) => void
): EmitterSubscription =>
  subscribeOnEvent(CONNECTION_INFO_UPDATED_ACTION, callback);

export const removeAllListenersFromConnectionInfoUpdates = (): void =>
  removeAllListenersFromEvent(CONNECTION_INFO_UPDATED_ACTION);

// ────────────────
// Public API Methods
// ────────────────

export const initialize = (): Promise<boolean> => NativeRnWifiP2P.init();

export const stop = (): Promise<boolean> => NativeRnWifiP2P.stop();

export const startDiscoveringPeers = (): Promise<string> =>
  new Promise((resolve, reject) => {
    NativeRnWifiP2P.discoverPeers()
      .then(() => resolve('success'))
      .catch((e) => reject(getError((e as any)?.code || 0)));
  });

export const stopDiscoveringPeers = (): Promise<void> =>
  NativeRnWifiP2P.stopPeerDiscovery();

export const getAvailablePeers = (): Promise<{ devices: Device[] }> =>
  NativeRnWifiP2P.getAvailablePeersList();

export const connect = (deviceAddress: string): Promise<void> =>
  connectWithConfig({ deviceAddress });

export const connectWithConfig = (config: ConnectionArgs): Promise<void> =>
  new Promise((resolve, reject) => {
    NativeRnWifiP2P.connectWithConfig(config)
      .then(resolve)
      .catch((e) => reject(getError((e as any)?.code || 0)));
  });

export const cancelConnect = (): Promise<void> =>
  new Promise((resolve, reject) => {
    NativeRnWifiP2P.cancelConnect()
      .then(resolve)
      .catch((e) => reject(getError((e as any)?.code || 0)));
  });

export const createGroup = (): Promise<void> =>
  new Promise((resolve, reject) => {
    NativeRnWifiP2P.createGroup()
      .then(resolve)
      .catch((e) => reject(getError((e as any)?.code || 0)));
  });

export const removeGroup = (): Promise<void> =>
  new Promise((resolve, reject) => {
    NativeRnWifiP2P.removeGroup()
      .then(resolve)
      .catch((e) => reject(getError((e as any)?.code || 0)));
  });

export const getConnectionInfo = (): Promise<WifiP2pInfo> =>
  NativeRnWifiP2P.getConnectionInfo();

export const getGroupInfo = (): Promise<GroupInfo | null> =>
  NativeRnWifiP2P.getGroupInfo();

export const sendFile = (pathToFile: string): Promise<FileTransferResult> =>
  NativeRnWifiP2P.sendFile(pathToFile);

export const sendFileTo = (
  pathToFile: string,
  address: string
): Promise<FileTransferResult> =>
  NativeRnWifiP2P.sendFileTo(pathToFile, address);

export const receiveFile = (
  folder: string,
  fileName: string,
  forceToScanGallery = false
): Promise<string> =>
  NativeRnWifiP2P.receiveFile(folder, fileName, forceToScanGallery);

export const sendMessage = (message: string): Promise<MessageTransferResult> =>
  NativeRnWifiP2P.sendMessage(message);

export const sendMessageTo = (
  message: string,
  address: string
): Promise<MessageTransferResult> =>
  NativeRnWifiP2P.sendMessageTo(message, address);

export const receiveMessage = <T,>(
  props: { meta: boolean },
  callback: (message: T) => void
) =>
  NativeRnWifiP2P.receiveMessage(props, (message: unknown) => {
    callback(message as T);
  });

export const stopReceivingMessage = (): void => {
  NativeRnWifiP2P.stopReceivingMessage();
};
