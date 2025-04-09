import NativeRnWifiP2P from '../NativeRnWifiP2P';
import { WifiP2PError } from '../errors';

export const sendFile = async (pathToFile: string) => {
  try {
    return await NativeRnWifiP2P.sendFile(pathToFile);
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};

export const sendFileTo = async (path: string, address: string) => {
  try {
    return await NativeRnWifiP2P.sendFileTo(path, address);
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};

export const receiveFile = async (
  folder: string,
  fileName: string,
  forceToScanGallery = false
) => {
  try {
    return await NativeRnWifiP2P.receiveFile(
      folder,
      fileName,
      forceToScanGallery
    );
  } catch (error) {
    throw WifiP2PError.fromNativeError(error);
  }
};
