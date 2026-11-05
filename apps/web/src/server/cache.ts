export const REVALIDATE = "no-cache";

export const NEVER_STORE = "no-store";

export const cacheControlFor = (status: number, isPrivate = false): string =>
  status === 200 && !isPrivate ? REVALIDATE : NEVER_STORE;
