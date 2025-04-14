// TODO: mapear todos os erros do wifi p2p

export class WifiP2PError extends Error {
  static readonly ERROR = 0;
  static readonly P2P_UNSUPPORTED = 1;
  static readonly BUSY = 2;

  static readonly ERROR_MESSAGES: Record<number, string> = {
    [WifiP2PError.ERROR]: 'Operation failed due to an internal error.',
    [WifiP2PError.P2P_UNSUPPORTED]: 'P2P is unsupported on this device.',
    [WifiP2PError.BUSY]: 'System is busy and cannot process the request.',
  };

  public readonly code: number;
  public readonly nativeError: any;

  constructor(code: number, nativeError?: any) {
    const message = WifiP2PError.ERROR_MESSAGES[code] ?? 'Unknown error.';
    super(message);

    this.name = 'WifiP2PError';
    this.code = code;
    this.nativeError = nativeError;
  }

  toString(): string {
    return `[${this.name}] Code: ${this.code} | Message: ${this.message}`;
  }

  static fromNativeError(error: any): WifiP2PError {
    const code =
      typeof error?.code === 'number' ? error.code : WifiP2PError.ERROR;
    return new WifiP2PError(code, error);
  }
}
