export const getCookie = (key: string) => {
  const cookies = document.cookie.split(";");
  const cookie = cookies.find((value) => value.includes(key));
  const [, value] = cookie?.trim().split("=") || [];
  return value;
};

export const getCSRFCookie = () => {
  return getCookie("csrf_access_token");
};
