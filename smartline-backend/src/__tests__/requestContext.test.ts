import { requestContext } from '../utils/requestContext';

describe('RequestContext', () => {
  it('returns undefined outside context', () => {
    expect(requestContext.get()).toBeUndefined();
    expect(requestContext.getRequestId()).toBeUndefined();
  });

  it('stores and retrieves context', (done) => {
    requestContext.run({ requestId: 'r-1', userId: 'u-1' }, () => {
      expect(requestContext.getRequestId()).toBe('r-1');
      expect(requestContext.getUserId()).toBe('u-1');
      done();
    });
  });

  it('isolates concurrent contexts', (done) => {
    let a = false, b = false;
    const check = () => { if (a && b) done(); };
    requestContext.run({ requestId: 'A' }, () => {
      setTimeout(() => { expect(requestContext.getRequestId()).toBe('A'); a = true; check(); }, 30);
    });
    requestContext.run({ requestId: 'B' }, () => {
      setTimeout(() => { expect(requestContext.getRequestId()).toBe('B'); b = true; check(); }, 15);
    });
  });

  it('allows mutation via set()', (done) => {
    requestContext.run({ requestId: 'r-2' }, () => {
      expect(requestContext.getUserId()).toBeUndefined();
      requestContext.set('userId', 'u-late');
      expect(requestContext.getUserId()).toBe('u-late');
      done();
    });
  });

  it('propagates through async', (done) => {
    requestContext.run({ requestId: 'async' }, () => {
      Promise.resolve().then(() => {
        expect(requestContext.getRequestId()).toBe('async');
        done();
      });
    });
  });
});
