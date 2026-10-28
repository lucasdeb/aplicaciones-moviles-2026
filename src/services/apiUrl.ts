type ApiLocation = {
  configuredUrl?: string;
  development: boolean;
  expoHost?: string;
  browserHostname?: string;
};

export function resolveApiUrl({ configuredUrl, development, expoHost, browserHostname }: ApiLocation): string {
  const explicit = configuredUrl?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  if (development) {
    const hostname = browserHostname || (expoHost ? new URL(expoHost.includes('://') ? expoHost : `http://${expoHost}`).hostname : undefined);
    if (hostname) {
      const api = new URL('http://localhost:3000/api');
      api.hostname = hostname;
      return api.toString();
    }
  }
  return 'http://localhost:3000/api';
}
