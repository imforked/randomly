export const getDateTime30MinutesFromNow = (): Date => {
  return new Date(Date.now() + 30 * 60 * 1000);
};
