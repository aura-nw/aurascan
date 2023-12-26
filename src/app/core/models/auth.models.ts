export interface IUser {
  email: string;
  refreshToken: string;
  accessToken: string;
}

export enum ELoginProvider {
  Google = 'GOOGLE',
  Email = 'EMAIL',
}
