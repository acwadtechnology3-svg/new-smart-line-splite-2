import { redact, getSensitiveKeys } from '../logger/redaction';

describe('Redaction', () => {
  it('should redact top-level sensitive fields', () => {
    const input = {
      username: 'john',
      password: 'super-secret-123',
      token: 'jwt-abc',
      email: 'john@example.com',
    };

    const result = redact(input);

    expect(result.username).toBe('john');
    expect(result.password).toBe('[REDACTED]');
    expect(result.token).toBe('[REDACTED]');
    // email is not in the default sensitive keys set for redaction.ts
    // (it IS in pino's redact paths for req.body.email, but the standalone
    // redact() function only redacts the keys in its own SENSITIVE_KEYS set)
  });

  it('should redact nested sensitive fields', () => {
    const input = {
      user: {
        name: 'Alice',
        credentials: {
          password: 'hidden',
          apiKey: 'key-123',
        },
      },
    };

    const result = redact(input);

    expect(result.user.name).toBe('Alice');
    expect(result.user.credentials.password).toBe('[REDACTED]');
    expect(result.user.credentials.apiKey).toBe('[REDACTED]');
  });

  it('should redact fields inside arrays', () => {
    const input = [
      { name: 'User1', secret: 'abc' },
      { name: 'User2', secret: 'def' },
    ];

    const result = redact(input);

    expect(result[0].name).toBe('User1');
    expect(result[0].secret).toBe('[REDACTED]');
    expect(result[1].secret).toBe('[REDACTED]');
  });

  it('should handle case-insensitive keys', () => {
    const input = {
      Password: 'hidden',
      TOKEN: 'hidden-token',
      ApiKey: 'hidden-key',
    };

    const result = redact(input);

    expect(result.Password).toBe('[REDACTED]');
    expect(result.TOKEN).toBe('[REDACTED]');
    expect(result.ApiKey).toBe('[REDACTED]');
  });

  it('should handle authorization and cookie headers', () => {
    const input = {
      headers: {
        authorization: 'Bearer abc123',
        cookie: 'session=xyz',
        'content-type': 'application/json',
      },
    };

    const result = redact(input);

    expect(result.headers.authorization).toBe('[REDACTED]');
    expect(result.headers.cookie).toBe('[REDACTED]');
    expect(result.headers['content-type']).toBe('application/json');
  });

  it('should handle card and CVV fields', () => {
    const input = {
      cardNumber: '4111111111111111',
      cvv: '123',
      amount: 100,
    };

    const result = redact(input);

    expect(result.cardNumber).toBe('[REDACTED]');
    expect(result.cvv).toBe('[REDACTED]');
    expect(result.amount).toBe(100);
  });

  it('should not mutate the original object', () => {
    const input = { password: 'secret', name: 'test' };
    const result = redact(input);

    expect(input.password).toBe('secret');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should handle null and undefined gracefully', () => {
    expect(redact(null)).toBeNull();
    expect(redact(undefined)).toBeUndefined();
    expect(redact('')).toBe('');
    expect(redact(42)).toBe(42);
  });

  it('should protect against deeply nested objects (max depth)', () => {
    // Build a 15-level deep object
    let obj: any = { password: 'deep' };
    for (let i = 0; i < 15; i++) {
      obj = { nested: obj };
    }

    const result = redact(obj);
    // At depth 10 it should stop and return [MAX_DEPTH]
    // The exact nesting level where it stops depends on implementation
    expect(JSON.stringify(result)).toContain('[MAX_DEPTH]');
  });

  it('should have a comprehensive sensitive keys list', () => {
    const keys = getSensitiveKeys();
    expect(keys.has('password')).toBe(true);
    expect(keys.has('token')).toBe(true);
    expect(keys.has('secret')).toBe(true);
    expect(keys.has('authorization')).toBe(true);
    expect(keys.has('cookie')).toBe(true);
    expect(keys.has('cvv')).toBe(true);
    expect(keys.has('cardnumber')).toBe(true);
    expect(keys.has('apikey')).toBe(true);
  });
});
