import { getCSRFCookie } from "./cookies";

export const get = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    const data = response.json();
    throw data;
  }

  return response.json();
};

export const post = async <T>(url: string, body: any): Promise<T> => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = response.json();
    throw data;
  }

  return response.json();
};

export const put = async <T>(url: string): Promise<T | null> => {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "X-CSRF-TOKEN": getCSRFCookie() },
  });

  if (!response.ok) {
    const data = response.json();
    throw data;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};
