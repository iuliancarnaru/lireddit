export const sleep = (ms: number) =>
  new Promise((resolved) => setTimeout(resolved, ms));
