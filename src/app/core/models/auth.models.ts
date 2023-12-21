export class User {
  data: {
    access_token: string;
  };
  meta: any;
}

export type UserStorage = {
  email: string;
  refreshToken: string;
  accessToken: string;
};
