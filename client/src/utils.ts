export const handleBadResponse = (apiResponse: Response) => {
  if (!apiResponse.ok) {
    if (apiResponse.status === 404) {
      throw new Error("Room not found.");
    }
    if (apiResponse.status === 410) {
      throw new Error("Room expired.");
    }

    throw new Error("Something went wrong.");
  }
};
