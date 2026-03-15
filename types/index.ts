export type Admin = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  admin?: Admin;
};

export type JWTPayload = {
  adminId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};
