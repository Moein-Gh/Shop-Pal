export interface User {
  id: string;
  email: string;
  name?: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}
export interface AuthResponse {
  token: string;
  user: Omit<User, "password">;
}
