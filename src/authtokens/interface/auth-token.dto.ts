export interface IAuthRefreshToken {
  _id: string;
  userId: string;
  refreshTokenExpiresAt: number;
  lastUsedAt?: number;
  isValid: boolean;
}

export interface IAuthAccessToken {
  _id: string;
  userId: string;
  accessTokenExpiresAt: number;
  refreshTokenId: string;
}
