import { describe, expect, it } from 'vitest';
import { verifyIdentityPassword } from './identity-password-verifier';

describe('verifyIdentityPassword', () => {
  const storedHash = 'AJ8rvRwshbQ1BGuK952T3xjJKXq57CjhInbHs2LbgJSu/7VSm4DOjzIKi+MDXKuH0Q==';

  it('returns true for the fixture password', () => {
    expect(verifyIdentityPassword('Test1234!', storedHash)).toBe(true);
  });

  it('returns false for a wrong password', () => {
    expect(verifyIdentityPassword('WrongPassword1!', storedHash)).toBe(false);
  });

  it('returns false for a malformed hash', () => {
    expect(verifyIdentityPassword('Test1234!', 'not-valid-base64!!!')).toBe(false);
  });

  it('returns false for a hash with the wrong version marker', () => {
    const decoded = Buffer.from(storedHash, 'base64');
    decoded[0] = 0x01;
    expect(verifyIdentityPassword('Test1234!', decoded.toString('base64'))).toBe(false);
  });
});
