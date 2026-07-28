import { describe, expect, it } from 'vitest';

import { assertHttpResponse, HttpApiError } from './http-error';

describe('assertHttpResponse', () => {
  it('accepts OK responses and rejects failures consistently', async () => {
    await expect(assertHttpResponse(new Response(null, { status: 204 }), 'Delete')).resolves.toBe(
      undefined,
    );

    const error = await assertHttpResponse(
      new Response('Forbidden', { status: 403 }),
      'Delete',
    ).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(HttpApiError);
    expect(error).toMatchObject({
      status: 403,
      operation: 'Delete',
      responseBody: 'Forbidden',
    });
  });
});
