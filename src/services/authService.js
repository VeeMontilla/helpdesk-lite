// SIGN-IN LAYER (Supabase Auth)
// ------------------------------------------------------------------
// Handles technician sign-in and sign-out. Passwords are sent straight to Supabase
// and are never stored by this app. Supabase keeps the sign-in session in the
// browser so a refresh does not sign you out.
// ------------------------------------------------------------------
import { supabase } from "../lib/supabaseClient.js";
import { describeAuthError, describeDatabaseError } from "../lib/errorMessages.js";

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("[HelpDesk Lite] could not read session:", error);
    return null;
  }
  return data.session;
}

// Calls callback(session) now and whenever someone signs in or out.
// Returns a function that stops listening.
// The callback only stores the session. Do not call other Supabase functions inside it.
export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    console.error("[HelpDesk Lite] sign-in error:", error);
    throw new Error(describeAuthError(error));
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("[HelpDesk Lite] sign-out error:", error);
}

// Asks the database whether the signed-in person is on the technician list.
// (Defined in supabase/access_policies.sql.)
export async function checkIsTechnician() {
  const { data, error } = await supabase.rpc("is_technician");
  if (error) {
    console.error("[HelpDesk Lite] technician check error:", error);
    throw new Error(describeDatabaseError(error, "Could not check your technician access. Please try again."));
  }
  return data === true;
}
