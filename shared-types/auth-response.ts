export type AuthUser = {
  _id: string | object;
  name: string;
  email: string;
  createdAt: Date;
};

export type SignUpResponse = {
  user: AuthUser;
};

export type LoginResponse = {
  user: AuthUser;
  token: string;
};
