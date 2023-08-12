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
  body: any = {}
): Promise<T | null> => {
  let headers: any = { "Content-Type": "application/json" };

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
