import { get } from 'svelte/store';
import { xsrf } from './stores';

const callApi = async <
  ResBody = Record<string, unknown>,
  ReqBody = Record<string, unknown>
>(
  input: string,
  method: RequestInit['method'] = 'GET',
  body?: ReqBody,
  headers?: Request['headers']
): Promise<{ status: number; body: ResBody }> => {
  const xsrfToken = get(xsrf);

  const res = await fetch('/api' + input, {
    headers: {
      ...headers,
      'Content-Type': body ? 'application/json' : undefined,
      'X-XSRF-TOKEN': xsrfToken,
    },
    method,
    body: body ? JSON.stringify(body) : undefined,
  });

  let resBody: ResBody;
  if (res.headers.get('Content-Type')?.includes('application/json')) {
    resBody = await res.json();
  }
  return { status: res.status, body: resBody };
};

export const generateXSRFToken = async () => {
  const res = await callApi<{ csrfToken: string }>('/auth/token');
  xsrf.set(res.body.csrfToken);
};

export default callApi;
