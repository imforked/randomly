const LOCALHOST_ORIGIN_PATTERN =
  /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;

export const ALLOWED_ORIGINS =
  process.env.ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim()) ?? [];

export const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) {
    return false;
  }

  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  return LOCALHOST_ORIGIN_PATTERN.test(origin);
};
