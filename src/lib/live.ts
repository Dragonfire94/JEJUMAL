/** Public hosts that may send product events or crash reports. Empty until a domain exists. */
export const LIVE_HOSTS: readonly string[] = [];

export function isLiveHost(hostname = typeof window === "undefined" ? "" : window.location.hostname): boolean {
  return hostname.length > 0 && LIVE_HOSTS.includes(hostname);
}
