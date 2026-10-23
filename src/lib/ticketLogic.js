// Checks the two Supabase settings from your .env.local file.
// Returns null when they look fine, or a plain-English message when something is wrong.
// It also REFUSES secret keys, so a powerful key can never end up inside the website.

function jwtRole(key) {
  const parts = key.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)).role ?? null;
  } catch {
    return null;
  }
}

export function checkSupabaseConfig(url, key) {
  const u = (url || "").trim();
  const k = (key || "").trim();

  if (!u || !k) {
    return "The Supabase project URL or publishable key is missing from your .env.local file.";
  }
  if (/YOUR[-_]/i.test(u) || /YOUR[-_]/i.test(k)) {
    return "Your .env.local file still contains the placeholder text from .env.example. Replace it with your real project URL and publishable key.";
  }
  if (k.startsWith("sb_secret_") || jwtRole(k) === "service_role") {
    return "That key is a SECRET key. Secret keys must never be used in a website. Use the publishable key (it starts with sb_publishable_) instead.";
  }
  let parsed;
  try {
    parsed = new URL(u);
  } catch {
    return "The project URL is not a valid web address. It should look like https://abcdefgh.supabase.co";
  }
  if (parsed.protocol !== "https:") {
    return "The project URL must start with https://";
  }
  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    return "The project URL should be just the address, like https://abcdefgh.supabase.co, with nothing after it.";
  }
  return null;
}
