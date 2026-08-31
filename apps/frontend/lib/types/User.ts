export type UserSetupRequest = {
  email: string;
  displayName: string;
  password: string;
};

export type UserLogin = {
  email: string;
  password: string;
};

export type User = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
};
