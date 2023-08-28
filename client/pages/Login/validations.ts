export const validateEmail = (email: string) => {
  if (!email) {
    throw new Error("Email is required");
  }
};
