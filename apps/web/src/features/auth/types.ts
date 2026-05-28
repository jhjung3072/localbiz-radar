export type AdminUser = {
  username: string;
  displayName: string;
  role: "ADMIN";
};

export type AuthResponse = {
  user: AdminUser;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type LogoutResponse = {
  message: string;
};
