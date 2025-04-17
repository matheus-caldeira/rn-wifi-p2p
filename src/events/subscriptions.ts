import { DeviceEventEmitter, type EmitterSubscription } from 'react-native';
import type { WifiP2PEventType, SubscriptionCallback } from './types';
import type {
  GroupInfo,
  WifiP2pInfo,
  Device,
  Message,
} from '../NativeRnWifiP2P';

const MODULE_NAME = 'RN_WIFI_P2P';
const subscriptionsMap = new Map<string, Set<EmitterSubscription>>();

export const subscribeOnEvent = (
  event: WifiP2PEventType,
  callback: SubscriptionCallback
): EmitterSubscription => {
  const fullEvent = `${MODULE_NAME}_${event}`;
  const subscription = DeviceEventEmitter.addListener(fullEvent, callback);

  if (!subscriptionsMap.has(fullEvent)) {
    subscriptionsMap.set(fullEvent, new Set());
  }

  subscriptionsMap.get(fullEvent)?.add(subscription);

  return subscription;
};

export const removeAllListenersFromEvent = (event: WifiP2PEventType): void => {
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
  subscribeOnEvent('THIS_DEVICE_CHANGED_ACTION', callback);

export const removeAllListenersFromThisDeviceChanged = (): void =>
  removeAllListenersFromEvent('THIS_DEVICE_CHANGED_ACTION');

export const subscribeOnPeersUpdates = (
  callback: (data: { devices: Device[] }) => void
): EmitterSubscription => subscribeOnEvent('PEERS_UPDATED', callback);

export const removeAllListenersFromPeersUpdates = (): void =>
  removeAllListenersFromEvent('PEERS_UPDATED');

export const subscribeOnConnectionInfoUpdates = (
  callback: (data: WifiP2pInfo) => void
): EmitterSubscription => subscribeOnEvent('CONNECTION_INFO_UPDATED', callback);

export const removeAllListenersFromConnectionInfoUpdates = (): void =>
  removeAllListenersFromEvent('CONNECTION_INFO_UPDATED');

export const subscribeOnMessageReceived = (
  callback: (data: Message<string>) => void
): EmitterSubscription => subscribeOnEvent('MESSAGE_RECEIVED', callback);

export const removeAllListenersFromMessageReceived = (): void =>
  removeAllListenersFromEvent('MESSAGE_RECEIVED');
