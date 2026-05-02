import crypto from 'crypto';

export interface JWTPayload {
  admin_id: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Generate JWT token
 */
export function generateJWT(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string,
  expiresInHours: number = 24
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const jwtPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInHours * 3600,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify JWT token
 */
export function verifyJWT(token: string, secret: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Hash password using PBKDF2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
  return salt.toString('hex') + ':' + hash.toString('hex');
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hash: string): boolean {
  try {
    const parts = hash.split(':');
    const salt = Buffer.from(parts[0], 'hex');
    const storedHash = parts[1];

    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
    return computedHash === storedHash;
  } catch {
    return false;
  }
}

/**
 * Generate API key
 */
export function generateAPIKey(): string {
  return 'cey_' + crypto.randomBytes(24).toString('hex');
}

/**
 * Generate API secret
 */
export function generateAPISecret(): string {
  return crypto.randomBytes(32).toString('hex');
}
