import NativeRnWifiP2P from '../NativeRnWifiP2P';

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
