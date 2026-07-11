import { pbkdf2Sync, timingSafeEqual } from 'node:crypto';

const VERSION_MARKER = 0x00;
const SALT_LENGTH = 16;
const SUBKEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 1000;
const PBKDF2_DIGEST = 'sha1';
const EXPECTED_HASH_LENGTH = 1 + SALT_LENGTH + SUBKEY_LENGTH;

export function verifyIdentityPassword(password: string, storedHashBase64: string): boolean {
  let decoded: Buffer;
  try {
    decoded = Buffer.from(storedHashBase64, 'base64');
  } catch {
    return false;
  }

  if (decoded.length !== EXPECTED_HASH_LENGTH || decoded[0] !== VERSION_MARKER) {
    return false;
  }

  const salt = decoded.subarray(1, 1 + SALT_LENGTH);
  const storedSubkey = decoded.subarray(1 + SALT_LENGTH);

  const computedSubkey = pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    SUBKEY_LENGTH,
    PBKDF2_DIGEST,
  );

  return timingSafeEqual(computedSubkey, storedSubkey);
}
