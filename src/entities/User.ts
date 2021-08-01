export default interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  verified_email?: boolean;
  created_at?: number;
  updated_at?: number;
}
