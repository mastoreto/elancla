import { describe, expect, test } from 'bun:test';
import { handleViewBeacon, type RecordView } from './handleViewBeacon';

interface Recorded {
  slug: string;
  visitor: { ip: string; userAgent: string };
}

function beacon(body: unknown, headers: Record<string, string> = {}) {
  return {
    request: new Request('https://example.org/api/views', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
    clientAddress: '203.0.113.7',
  };
}

function recorder() {
  const calls: Recorded[] = [];
  const record: RecordView = async (slug, visitor) => {
    calls.push({ slug, visitor });
  };
  return { calls, record };
}

describe('handleViewBeacon', () => {
  test('a valid beacon answers 204 and records the reader address and user agent', async () => {
    const { calls, record } = recorder();
    const response = await handleViewBeacon(
      beacon({ slug: 'mi-post' }, { 'user-agent': 'Mozilla/5.0' }),
      record
    );
    expect(response.status).toBe(204);
    expect(calls).toEqual([
      {
        slug: 'mi-post',
        visitor: { ip: '203.0.113.7', userAgent: 'Mozilla/5.0' },
      },
    ]);
  });

  test('a missing user agent is recorded as empty (the API counts it as a bot)', async () => {
    const { calls, record } = recorder();
    const request = beacon({ slug: 'p' });
    request.request.headers.delete('user-agent');
    await handleViewBeacon(request, record);
    expect(calls[0]?.visitor.userAgent).toBe('');
  });

  test.each([
    ['not json', 'nope'],
    ['no slug', {}],
    ['an empty slug', { slug: '  ' }],
    ['a slug that is not a string', { slug: 42 }],
    ['a huge slug', { slug: 'a'.repeat(500) }],
    ['extra fields', { slug: 'p', ip: '1.1.1.1' }],
  ])('%s answers 400 and records nothing', async (_name, body) => {
    const { calls, record } = recorder();
    const response = await handleViewBeacon(beacon(body), record);
    expect(response.status).toBe(400);
    expect(calls).toEqual([]);
  });

  test('the address of the body can not be forged: only the request one is used', async () => {
    const { calls, record } = recorder();
    await handleViewBeacon(beacon({ slug: 'p', ip: '9.9.9.9' }), record);
    expect(calls).toEqual([]);
  });
});
