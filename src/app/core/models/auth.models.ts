export interface IUser {
  email: string;
  refreshToken: string;
  accessToken: string;
  provider?: ELoginProvider;
}

export enum ELoginProvider {
  Google = 'google',
  Password = 'password',
}
