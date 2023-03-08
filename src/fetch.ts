import { getCSRFCookie } from "./cookies";

interface FetchOptions {
  includeCSRF?: boolean;
}

export const get = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    const data = await response.json();
    throw data;
  }

  return await response.json();
};

export const post = async <T>(
  url: string,
  body: any = {},
  options: FetchOptions = {}
): Promise<T | null> => {
  let headers: any = { "Content-Type": "application/json" };

  if (options.includeCSRF) {
    headers["X-CSRF-TOKEN"] = getCSRFCookie();
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json();
    throw data;
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
};

export const put = async <T>(url: string): Promise<T | null> => {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "X-CSRF-TOKEN": getCSRFCookie() },
  });

  if (!response.ok) {
    const data = await response.json();
    throw data;
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
};

export const del = async (url: string, body: any = {}): Promise<null> => {
  const response = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json();
    throw data;
  }

  return null;
};
