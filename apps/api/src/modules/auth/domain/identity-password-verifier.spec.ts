import { describe, expect, it } from 'vitest';
import { hashIdentityPassword, verifyIdentityPassword } from './identity-password-verifier';

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

describe('hashIdentityPassword', () => {
  it('produces a hash that verifies with the same password', () => {
    const hash = hashIdentityPassword('MySecret1!');
    expect(verifyIdentityPassword('MySecret1!', hash)).toBe(true);
  });

  it('produces a hash that does not verify with a different password', () => {
    const hash = hashIdentityPassword('MySecret1!');
    expect(verifyIdentityPassword('Different2!', hash)).toBe(false);
  });

  it('produces a base64 hash with the expected length', () => {
    const hash = hashIdentityPassword('MySecret1!');
    const decoded = Buffer.from(hash, 'base64');
    expect(decoded.length).toBe(49);
    expect(decoded[0]).toBe(0x00);
  });
});
