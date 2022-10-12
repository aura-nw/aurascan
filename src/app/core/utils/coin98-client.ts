import { Client } from '@coin98-com/connect-sdk';
import { requestParameter } from '@coin98-com/connect-sdk/dist/types/client';
import { StdSignDoc } from '@cosmjs/amino';
import { ChainInfo } from '@keplr-wallet/types';

export type ConnectResponse = {
  result: any;
  id: string;
};

export type AccountResponse = {
  name: string;
  algo: string;
  pubKey: string;
  address: string;
  bech32Address: string;
  isNanoLedger: boolean;
};

export class Coin98Client {
  private chainInfo: ChainInfo;
  private client: Client;
  private connectionId: string;

  constructor(chainInfo: ChainInfo) {
    this.chainInfo = chainInfo;
    this.client = new Client();
  }

  request(requestParameter: requestParameter) {
    if (this.connectionId) {
      return this.client.request({
        id: this.connectionId,
        ...requestParameter,
      });
    }

    return this.connect().then(
      (connectionId) =>
        connectionId &&
        this.client.request({
          id: connectionId,
          ...requestParameter,
        }),
    );
  }

  async connect(): Promise<string> {
    if (this.connectionId) {
      return this.connectionId;
    }

    try {
      const res = await this.client.connect(this.chainInfo.chainId, {
        name: 'AuraScan',
        url: (this.chainInfo as any).explorer,
        logo: (this.chainInfo as any).logo,
      });

      const { result, id } = res as ConnectResponse;
      if (result && id) {
        this.connectionId = id;
        return id;
      }
      return undefined;
    } catch (error) {
      throw new Error(`Can not connect to ${this.chainInfo.chainId}`);
    }
  }

  async getAccount(): Promise<AccountResponse> {
    if (!this.connectionId) {
      return undefined;
    }

    return this.client
      .request({
        method: 'cosmos_getKey',
        params: [this.chainInfo.chainId],
      })
      .then((response) => {
        const { result } = response as ConnectResponse;
        return result;
      });
  }

  async suggestChain(): Promise<unknown> {
    try {
      return this.request({
        method: 'cosmos_experimentalSuggestChain',
        params: [this.chainInfo],
      });
    } catch (e) {
      return `Can not suggestChain ${e}`;
    }
  }

  async signAmino(signer: string, signDoc: StdSignDoc) {
    return this.request({
      method: 'cosmos_signAmino',
      params: [
        {
          chainId: this.chainInfo.chainId,
          signer,
          signDoc,
        },
      ],
    });
  }

  async signDirect(signer: string, signDoc: StdSignDoc) {
    return await this.request({
      method: 'cosmos_signDirect',
      params: [this.chainInfo.chainId, signer, signDoc],
    });
  }

  signAndBroadcast(signer: string, signDoc: StdSignDoc): Promise<any> {
    return this.request({
      method: 'cosmos_signAndBroadcast' as any,
      params: [
        {
          chainId: this.chainInfo.chainId,
          signer,
          signDoc,
          isDirect: false,
        },
      ],
    });
  }

  execute(
    signer: string,
    contractAddress: string,
    msg: unknown,
    memo: string,
    fee: any,
    transferAmount?: any,
    contractCodeHash?: string,
  ) {
    return this.request({
      method: 'cosmos_execute' as any,
      params: [
        {
          chainId: this.chainInfo.chainId,
          signer,
          contractAddress,
          msg,
          memo,
          fee,
        },
      ],
    });
  }

  signArbitrary(signer: string, data: unknown) {
    return this.request({
      method: 'cosmos_signArbitrary' as any,
      params: [
        {
          chainId: this.chainInfo.chainId,
          signer,
          data,
        },
      ],
    });
  }
}
