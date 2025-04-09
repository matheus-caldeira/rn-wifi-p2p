export type SubscriptionCallback = (...args: any[]) => void;

export enum WifiP2PEvent {
  PeersUpdated = 'PEERS_UPDATED',
  ConnectionInfoUpdated = 'CONNECTION_INFO_UPDATED',
  ThisDeviceChanged = 'THIS_DEVICE_CHANGED_ACTION',
}

export type WifiP2PEventType = `${WifiP2PEvent}`;
