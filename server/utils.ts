import sanitizeHtml from "sanitize-html";

export const getDateTime30MinutesFromNow = (): Date => {
  return new Date(Date.now() + 30 * 60 * 1000);
};

export const sanitizePlainText = (text: string) => {
  return sanitizeHtml(text.trim(), {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
};
