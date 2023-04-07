import { get } from 'svelte/store';
import { xsrf } from '../stores';

const callApi = async <
  ResBody = Record<string, unknown>,
  ReqBody = Record<string, unknown>
>(
  input: string,
  method: RequestInit['method'] = 'GET',
  body?: ReqBody,
  headers?: RequestInit['headers']
): Promise<{ status: number; body: ResBody }> => {
  let xsrfToken = get(xsrf);
  if (!xsrfToken && method.toUpperCase() !== 'GET') {
    await generateXSRFToken();
    xsrfToken = get(xsrf);
  }

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
  if (res.status === 200) {
    xsrf.set(res.body.csrfToken);
  } else {
    console.error('Could not retrieve csrf-token');
  }
};

export default callApi;
