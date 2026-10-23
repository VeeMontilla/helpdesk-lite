// SUPABASE CONNECTION
// ------------------------------------------------------------------
// The website needs only two values: the project URL and the PUBLISHABLE key.
// They come from a local file named .env.local (copy .env.example to create it).
// Never put a database password, a "secret" key, or a "service_role" key in this
// project. The publishable key is designed to be public; the access rules in
// supabase/access_policies.sql are what protect the data.
// ------------------------------------------------------------------
import { createClient } from "@supabase/supabase-js";
import { checkSupabaseConfig } from "./supabaseConfig.js";

const url = String(import.meta.env.VITE_SUPABASE_URL || "").trim();
const key = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "").trim();

// null when the settings look fine, otherwise a plain-English message (shown on the setup screen).
export const configProblem = checkSupabaseConfig(url, key);

// Stays null when the settings are missing or unsafe, so the app shows the setup screen
// instead of trying to connect.
export const supabase = configProblem ? null : createClient(url, key);
