import NativeRnWifiP2P, { type Message } from '../NativeRnWifiP2P';
import { WifiP2PError } from '../errors';
import { subscribeOnMessageReceived } from '../events';

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

export const startReceivingMessage = async <T = string>(
  props?: { meta?: boolean },
  callback?: (message: Message<T>) => void,
  { parse, useJson }: { parse?: (message: string) => T; useJson?: boolean } = {}
): Promise<() => void> => {
  try {
    await NativeRnWifiP2P.startReceivingMessage(props);

    let remove: () => void;

    if (callback) {
      const subscription = subscribeOnMessageReceived((data) => {
        let message: T;

        if (parse) {
          message = parse(data.message);
        } else if (useJson) {
          message = JSON.parse(data.message);
        } else {
          message = data.message as T;
        }

        callback({
          ...data,
          message,
        });
      });

      remove = subscription.remove;
    }

    return () => {
      NativeRnWifiP2P.stopReceivingMessage();
      if (remove) remove();
    };
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
