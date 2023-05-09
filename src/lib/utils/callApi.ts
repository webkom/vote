import { get } from 'svelte/store';
import { xsrf } from '../stores';

const callApi = async <
  ResBody = Record<string, unknown>,
  ReqBody = Record<string, unknown>
>(
  input: string,
  method: RequestInit['method'] = 'GET',
  body?: ReqBody,
  headers?: RequestInit['headers'],
  fetchFunc = fetch
): Promise<
  | {
      result: 'success';
      status: number;
      body: ResBody;
    }
  | {
      result: 'failure';
      status: number;
      body: {
        message: string;
        name: string;
      };
    }
> => {
  let xsrfToken = get(xsrf);
  if (!xsrfToken && method.toUpperCase() !== 'GET') {
    await generateXSRFToken();
    xsrfToken = get(xsrf);
  }

  const res = await fetchFunc('/api' + input, {
    headers: {
      ...headers,
      'content-type': body ? 'application/json' : undefined,
      'X-XSRF-TOKEN': xsrfToken,
    },
    method,
    body: body ? JSON.stringify(body) : undefined,
  });

  let resBody: ResBody & { message: string; name: string };
  if (res.headers.get('Content-Type')?.includes('application/json')) {
    resBody = await res.json();
  }

  if (res.status < 400) {
    return { result: 'success', status: res.status, body: resBody };
  } else {
    return {
      result: 'failure',
      status: res.status,
      body: resBody,
    };
  }
};

export const generateXSRFToken = async () => {
  const res = await callApi<{ csrfToken: string }>('/auth/token');
  if (res.result === 'success') {
    xsrf.set(res.body.csrfToken);
  } else {
    console.error('Could not retrieve csrf-token');
  }
};

export default callApi;
