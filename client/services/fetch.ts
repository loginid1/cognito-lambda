export const getCookieValue = (name: string): string => {
  const cookie = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith(name + "="));
  if (!cookie) return "";
  return cookie.split("=")[1];
};

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
  headers: any = {}
): Promise<T | null> => {
  let _headers: any = { "Content-Type": "application/json" };

  const response = await fetch(url, {
    method: "POST",
    headers: { ..._headers, ...headers },
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

export const postWithCRSF = async <T>(url: string, body: any) => {
  const csrf = getCookieValue("csrf_access_token");
  const response = post<T>(url, body, {
    "X-CSRF-TOKEN": csrf,
  });
  return response;
};
