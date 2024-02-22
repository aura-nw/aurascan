import { STORAGE_KEY } from '../constant';

export function parseErrorFromMetamask(error: any) {
  const walletName = localStorage.getItem(STORAGE_KEY.CURRENT_WALLET);
  const { message } = error;

  if (walletName == 'leap-metamask-cosmos-snap') {
    if (message == 'User denied transaction') {
      return {
        code: undefined,
        message,
      };
    }
  }

  return error;
}
