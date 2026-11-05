// Local tests may use loopback servers. Live tests never load this guard.
const originalFetch = globalThis.fetch;
globalThis.fetch = (input, options) => {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (!['localhost','127.0.0.1','[::1]'].includes(url.hostname)) throw new Error('External fetch disabled in local tests: '+url.origin);
  return originalFetch(input, options);
};
