import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'palettehubb_production_secret_key_9824_super_secure_jwt';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = 'palette_supplier_session';

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export interface SupplierSessionPayload {
  supplierId: string;
  email: string;
  name: string;
}

export async function createSupplierToken(payload: SupplierSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedSecret);
}

export async function verifySupplierToken(token: string): Promise<SupplierSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return {
      supplierId: payload.supplierId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch (err) {
    return null;
  }
}

export async function getSupplierSession(): Promise<SupplierSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySupplierToken(token);
}

export const SUPPLIER_COOKIE_NAME = COOKIE_NAME;
