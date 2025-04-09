import NativeRnWifiP2P from '../NativeRnWifiP2P';
import { WifiP2PError } from '../errors';

export const createGroup = async () => {
  try {
    return await NativeRnWifiP2P.createGroup();
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};

export const removeGroup = async () => {
  try {
    return await NativeRnWifiP2P.removeGroup();
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};

export const getConnectionInfo = () => {
  try {
    return NativeRnWifiP2P.getConnectionInfo();
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};

export const getGroupInfo = () => {
  try {
    return NativeRnWifiP2P.getGroupInfo();
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};
