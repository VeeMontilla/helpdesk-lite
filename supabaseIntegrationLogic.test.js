// Run with: npm test
// Checks the pure helper code used by the Supabase connection:
// ticket ID formatting, the key-safety check, and friendly error messages.
// These tests do NOT contact Supabase.
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatTicketCode, parseTicketCode, rowToTicket } from "../src/lib/ticketMapping.js";
import { checkSupabaseConfig } from "../src/lib/supabaseConfig.js";
import { describeAuthError, describeDatabaseError } from "../src/lib/errorMessages.js";

// ---- ticket IDs ----
test("ticket numbers are shown as HD-0001 style codes", () => {
  assert.equal(formatTicketCode(1), "HD-0001");
  assert.equal(formatTicketCode(42), "HD-0042");
  assert.equal(formatTicketCode(12345), "HD-12345");
});

test("ticket codes convert back to numbers, and bad codes give null", () => {
  assert.equal(parseTicketCode("HD-0007"), 7);
  assert.equal(parseTicketCode("HD-12345"), 12345);
  assert.equal(parseTicketCode("HD-0000"), null);
  assert.equal(parseTicketCode("7"), null);
  assert.equal(parseTicketCode("HD-abc"), null);
  assert.equal(parseTicketCode(undefined), null);
});

test("a database row becomes the ticket shape the screens use", () => {
  const row = {
    ticket_number: 6,
    name: "Test Person",
    category: "Email",
    description: "Fictional mailbox is full.",
    status: "Open",
    created_at: "2026-10-21T10:00:00+00:00",
    updated_at: "2026-10-21T10:00:00+00:00",
  };
  assert.deepEqual(rowToTicket(row), {
    id: "HD-0006",
    name: "Test Person",
    category: "Email",
    description: "Fictional mailbox is full.",
    status: "Open",
    createdAt: "2026-10-21T10:00:00+00:00",
    updatedAt: "2026-10-21T10:00:00+00:00",
  });
});

// ---- settings safety check ----
function fakeJwt(payload) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64(payload)}.signature`;
}

const GOOD_URL = "https://abcdefghijkl.supabase.co";
const GOOD_KEY = "sb_publishable_FAKEKEYFORTESTING";

test("good settings pass the check", () => {
  assert.equal(checkSupabaseConfig(GOOD_URL, GOOD_KEY), null);
});

test("missing settings are reported", () => {
  assert.match(checkSupabaseConfig("", GOOD_KEY), /missing/i);
  assert.match(checkSupabaseConfig(GOOD_URL, ""), /missing/i);
  assert.match(checkSupabaseConfig(undefined, undefined), /missing/i);
});

test("placeholder text from .env.example is reported", () => {
  assert.match(
    checkSupabaseConfig("https://YOUR-PROJECT-REF.supabase.co", "sb_publishable_YOUR_KEY_HERE"),
    /placeholder/i
  );
});

test("secret keys are refused", () => {
  assert.match(checkSupabaseConfig(GOOD_URL, "sb_secret_FAKEKEYFORTESTING"), /SECRET/);
  assert.match(checkSupabaseConfig(GOOD_URL, fakeJwt({ role: "service_role" })), /SECRET/);
});

test("the older anon-style key (role anon) is not treated as secret", () => {
  assert.equal(checkSupabaseConfig(GOOD_URL, fakeJwt({ role: "anon" })), null);
});

test("bad project URLs are reported", () => {
  assert.match(checkSupabaseConfig("not a url", GOOD_KEY), /valid web address/i);
  assert.match(checkSupabaseConfig("http://abcdefghijkl.supabase.co", GOOD_KEY), /https/);
  assert.match(checkSupabaseConfig(GOOD_URL + "/rest/v1", GOOD_KEY), /nothing after/i);
});

// ---- friendly error messages ----
test("sign-in errors become short messages", () => {
  assert.match(describeAuthError({ message: "Invalid login credentials", status: 400 }), /incorrect/i);
  assert.match(describeAuthError({ message: "Email not confirmed" }), /not been confirmed/i);
  assert.match(describeAuthError({ message: "x", status: 429 }), /too many/i);
  assert.match(describeAuthError({ message: "TypeError: Failed to fetch" }), /reach Supabase/i);
  assert.match(describeAuthError({ message: "something odd" }), /Sign-in failed/);
});

test("database errors become short messages", () => {
  const fb = "fallback text";
  assert.match(describeDatabaseError({ code: "42501", message: "x" }, fb), /permission/i);
  assert.match(
    describeDatabaseError({ message: 'new row violates row-level security policy for table "tickets"' }, fb),
    /permission/i
  );
  assert.match(describeDatabaseError({ code: "PGRST116", message: "x" }, fb), /could not be found/i);
  assert.match(describeDatabaseError({ message: "JWT expired" }, fb), /expired/i);
  assert.match(describeDatabaseError({ message: "TypeError: Failed to fetch" }, fb), /reach Supabase/i);
  assert.equal(describeDatabaseError({ message: "weird" }, fb), fb);
});
