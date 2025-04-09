import NativeRnWifiP2P, { type ConnectionArgs } from '../NativeRnWifiP2P';
import { WifiP2PError } from '../errors';

export const connect = async (deviceAddress: string) => {
  try {
    return await connectWithConfig({ deviceAddress });
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};

export const connectWithConfig = async (
  config: ConnectionArgs
): Promise<void> => {
  try {
    return await NativeRnWifiP2P.connectWithConfig(config);
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};

export const cancelConnect = async (): Promise<void> => {
  try {
    return await NativeRnWifiP2P.cancelConnect();
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};
