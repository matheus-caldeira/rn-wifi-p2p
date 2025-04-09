import NativeRnWifiP2P from '../NativeRnWifiP2P';
import { WifiP2PError } from '../errors';

export const startDiscoveringPeers = async () => {
  try {
    return await NativeRnWifiP2P.discoverPeers();
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};

export const stopDiscoveringPeers = async () => {
  try {
    return await NativeRnWifiP2P.stopPeerDiscovery();
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};

export const getAvailablePeers = async () => {
  try {
    return await NativeRnWifiP2P.getAvailablePeersList();
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};
