import bcrypt from 'bcrypt';

export function generateHash(password: string): Promise<string> {
  const hashCost = 12;
  return bcrypt.hash(password, hashCost);
}
