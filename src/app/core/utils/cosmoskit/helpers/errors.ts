import { STORAGE_KEY } from '../constant';

export function parseError(error: any) {
  const walletName = localStorage.getItem(STORAGE_KEY.CURRENT_WALLET);
  const { message } = error;

  switch (walletName) {
    case 'leap-metamask-cosmos-snap':
      if (message == 'User denied transaction') {
        return {
          code: undefined,
          message,
        };
      }
      return error;
    case 'coin98-extension':
      if (message == 'User rejected the request.') {
        return {
          code: undefined,
          message,
        };
      }
      return error;
    default:
      return error;
  }
}
