export const base64ToBuffer = (data: string): ArrayBuffer => {
  data = data.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
};

export const bufferToBase64 = (data: ArrayBuffer) => {
  const bytes = new Uint8Array(data);
  let binary = "";

  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
