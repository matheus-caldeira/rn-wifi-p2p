import NativeRnWifiP2P from '../NativeRnWifiP2P';
import { WifiP2PError } from '../errors';

export const sendMessage = async (message: string) => {
  try {
    return await NativeRnWifiP2P.sendMessage(message);
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};

export const sendMessageTo = async (message: string, address: string) => {
  try {
    return await NativeRnWifiP2P.sendMessageTo(message, address);
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};

export const receiveMessage = <T>(
  props: { meta: boolean },
  callback: (message: { message: T; fromAddress?: string }) => void
) => {
  try {
    return NativeRnWifiP2P.receiveMessage(props, (message: unknown) => {
      callback(message as { message: T; fromAddress?: string });
    });
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};

export const stopReceivingMessage = () => {
  try {
    return NativeRnWifiP2P.stopReceivingMessage();
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};
