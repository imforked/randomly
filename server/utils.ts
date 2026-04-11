export const validateBody = (body: any) => {
  if (typeof body !== "object" || body === null) return false;

  return true;
};
