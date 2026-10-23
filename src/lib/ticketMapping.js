// Translates between the database's version of a ticket and the app's version.
//
// Database row:  { ticket_number: 7, name, category, description, status, created_at, updated_at }
// App ticket:    { id: "HD-0007", name, category, description, status, createdAt, updatedAt }
//
// The "HD-0007" text is never stored. It is built from the database counter each time.
// Pure functions only (no React, no Supabase), so they are easy to test.

export function formatTicketCode(ticketNumber) {
  return "HD-" + String(ticketNumber).padStart(4, "0");
}

// "HD-0007" -> 7. Returns null if the text is not a valid ticket code.
export function parseTicketCode(code) {
  const match = /^HD-(\d+)$/.exec(String(code));
  if (!match) return null;
  const number = Number(match[1]);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

export function rowToTicket(row) {
  return {
    id: formatTicketCode(row.ticket_number),
    name: row.name,
    category: row.category,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
