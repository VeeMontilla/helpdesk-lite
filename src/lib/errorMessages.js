// Turns technical Supabase errors into short messages a person can act on.
// The original error is still printed in the browser console for debugging.

const NETWORK = /failed to fetch|networkerror|network request failed|fetch failed/i;

export function describeAuthError(error) {
  const message = String((error && error.message) || "");
  const status = error && error.status;
  if (NETWORK.test(message)) {
    return "Could not reach Supabase. Check your internet connection and the project URL.";
  }
  if (/email not confirmed/i.test(message)) {
    return "This account has not been confirmed yet. Ask the administrator to confirm it in Supabase.";
  }
  if (status === 429 || /rate limit|too many/i.test(message)) {
    return "Too many sign-in attempts. Wait a minute and try again.";
  }
  if (/invalid login credentials|invalid credentials/i.test(message) || status === 400) {
    return "The email or password is incorrect.";
  }
  return "Sign-in failed. Please try again.";
}

export function describeDatabaseError(error, fallback) {
  const message = String((error && error.message) || "");
  const code = error && error.code;
  if (NETWORK.test(message)) {
    return "Could not reach Supabase. Check your internet connection and try again.";
  }
  if (/jwt expired/i.test(message) || code === "PGRST301") {
    return "Your sign-in has expired. Please sign out and sign in again.";
  }
  if (code === "42501" || /row-level security|permission denied/i.test(message)) {
    return "You do not have permission to do that. Make sure you are signed in as a technician.";
  }
  if (code === "PGRST116") {
    return "That ticket could not be found, or you do not have permission to change it.";
  }
  if (code === "23514") {
    return "The database rejected those ticket details. Check the fields and try again.";
  }
  return fallback;
}
