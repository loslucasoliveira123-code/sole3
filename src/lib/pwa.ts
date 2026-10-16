// The only app-shell service worker registrar. Messaging workers are untouched.
export function shouldDisableAppWorker(production: boolean, framed: boolean, hostname: string, search: string) {
  const previewDomains = ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"];
  return !production || framed || hostname.startsWith("id-preview--") || hostname.startsWith("preview--") ||
    previewDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`)) ||
    new URLSearchParams(search).get("sw") === "off";
}

export async function initializePwa() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const disabled = shouldDisableAppWorker(import.meta.env.PROD, window.self !== window.top, window.location.hostname, window.location.search);
  if (disabled) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.filter((registration) => {
      const workers = [registration.active, registration.waiting, registration.installing];
      return workers.some((worker) => worker && new URL(worker.scriptURL).origin === window.location.origin && new URL(worker.scriptURL).pathname === "/sw.js");
    }).map((registration) => registration.unregister()));
    return;
  }
  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
  // Check on a normal page visit; never poll or force a reload.
  await registration.update();
}