import NativeRnWifiP2P, { type Config } from '../NativeRnWifiP2P';

import { WifiP2PError } from '../errors';

export const initialize = async () => {
  try {
    return await NativeRnWifiP2P.init();
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};

export const stop = async () => {
  try {
    return await NativeRnWifiP2P.stop();
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};

export const getConfig = async () => {
  try {
    return await NativeRnWifiP2P.getConfig();
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};

export const setConfig = async (config: Config) => {
  try {
    return await NativeRnWifiP2P.setConfig(config);
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};
