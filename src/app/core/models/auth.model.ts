import { AppUser } from './user.model';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AppUser;
}
