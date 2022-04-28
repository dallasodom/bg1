import FakeTimers from '@sinonjs/fake-timers';

import { fetchJson } from '../fetch';

const fetchMock = jest.fn();
self.fetch = fetchMock;

function mockFetch(body: any, headers: { [name: string]: string } = {}) {
  headers = Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
  );
  fetchMock.mockResolvedValue({
    status: 200,
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
    json: () => body,
  });
}

const url = 'https://example.com/';
const signal = expect.any(AbortSignal);

describe('fetchJson()', () => {
  it('returns response', async () => {
    mockFetch({ a: 1 }, { 'content-type': 'application/json' });
    expect(await fetchJson(url)).toEqual({ status: 200, data: { a: 1 } });
  });

  it('returns empty data object for non-JSON response', async () => {
    mockFetch(null);
    expect(await fetchJson(url)).toEqual({ status: 200, data: {} });
  });

  it('uses POST if method not specified and data included', async () => {
    const data = { name: 'Mickey' };
    await fetchJson(url, { data });
    expect(fetchMock).lastCalledWith(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal,
    });
  });

  it('adds params to URL', async () => {
    await fetchJson(url, { params: { start: 5, end: 15 } });
    expect(fetchMock).lastCalledWith(url + '?start=5&end=15', { signal });
  });

  it('returns status=0 response on timeout', async () => {
    jest.spyOn(console, 'error').mockImplementationOnce(() => null);
    const clock = FakeTimers.install();
    const timeout = 5000;
    fetchMock.mockImplementationOnce((url: string, init: RequestInit) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (init.signal?.aborted) {
            reject('aborted');
          } else {
            resolve({ status: 200, data: {} });
          }
        }, timeout);
      });
    });
    const promise = fetchJson(url, { timeout });
    await clock.tickAsync(timeout);
    expect(await promise).toEqual({ status: 0, data: null });
    clock.uninstall();
  });
});
