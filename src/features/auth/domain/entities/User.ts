export type UserRole = 'vendedor' | 'cliente';

export interface User {
  id:         string;
  email:      string;
  username:   string;
  role:       UserRole;
  avatarUrl?: string;
}