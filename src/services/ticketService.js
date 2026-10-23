// STORAGE LAYER (Supabase database)
// ------------------------------------------------------------------
// This is the ONLY file that reads or writes tickets. The screens call these three
// functions and never talk to the database directly.
//
// Who may do what is decided by the database, not by this file. See
// supabase/access_policies.sql: only signed-in technicians can read, create, and
// update tickets, and nobody can delete them.
// ------------------------------------------------------------------
import { supabase } from "../lib/supabaseClient.js";
import { STATUSES } from "../lib/ticketLogic.js";
import { parseTicketCode, rowToTicket } from "../lib/ticketMapping.js";
import { describeDatabaseError } from "../lib/errorMessages.js";

export const STORAGE_MODE = "Supabase database";

const TABLE = "tickets";
const COLUMNS = "ticket_number, name, category, description, status, created_at, updated_at";

function fail(error, fallbackMessage) {
  console.error("[HelpDesk Lite] database error:", error);
  throw new Error(describeDatabaseError(error, fallbackMessage));
}

// Loads every ticket the signed-in technician is allowed to see.
export async function listTickets() {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .order("created_at", { ascending: false });
  if (error) fail(error, "Could not load tickets. Please try again.");
  return data.map(rowToTicket);
}

// Saves a new ticket. The database fills in the ID, ticket number, "Open" status,
// and timestamps, so only these three fields are sent.
export async function createTicket(input) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: input.name.trim(),
      category: input.category,
      description: input.description.trim(),
    })
    .select(COLUMNS)
    .single();
  if (error) fail(error, "Could not submit the ticket. Please try again.");
  return rowToTicket(data);
}

// Changes one ticket's status. ticketCode is the ID people see, like "HD-0007".
// The ticket number inside it is unique, so it finds exactly one ticket.
export async function updateTicketStatus(ticketCode, newStatus) {
  if (!STATUSES.includes(newStatus)) throw new Error("Invalid status: " + newStatus);
  const ticketNumber = parseTicketCode(ticketCode);
  if (ticketNumber === null) throw new Error("Invalid ticket ID: " + ticketCode);
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: newStatus })
    .eq("ticket_number", ticketNumber)
    .select(COLUMNS)
    .single();
  if (error) fail(error, "Could not update the ticket. Please try again.");
  return rowToTicket(data);
}
