export class HttpApiError extends Error {
  readonly status: number;
  readonly operation: string;
  readonly responseBody: string;

  constructor(operation: string, status: number, responseBody = '') {
    super(`${operation} failed with status ${status}`);
    this.name = 'HttpApiError';
    this.status = status;
    this.operation = operation;
    this.responseBody = responseBody;
  }
}

export async function assertHttpResponse(response: Response, operation: string): Promise<void> {
  if (response.ok) {
    return;
  }

  let responseBody = '';
  try {
    responseBody = await response.text();
  } catch {
    // Response bodies are optional diagnostic context.
  }
  throw new HttpApiError(operation, response.status, responseBody);
}
