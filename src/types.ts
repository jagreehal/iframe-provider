export interface User {
  _id: string;
  email: string;
  password: string;
  roles: ('user' | 'admin' | 'editor')[];
}
interface OneTimeToken {
  _id: string;
  id: string;
  jwt: string;
  createdAt: Date;
}
