// Pure ticket rules. No React and no storage in this file, so it is easy to test.

export const STATUSES = ["Open", "In Progress", "Resolved"];

export const CATEGORIES = [
  "Password / Account",
  "Network / Wi-Fi",
  "Hardware",
  "Software",
  "Printer",
  "Email",
  "Other",
];

export const LIMITS = { name: 60, description: 1000, minDescription: 10 };

// Makes the next ID, like HD-0006, by looking at the highest ID already used.
export function generateTicketId(tickets) {
  const highest = tickets.reduce((max, t) => {
    const n = parseInt(String(t.id).replace("HD-", ""), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return "HD-" + String(highest + 1).padStart(4, "0");
}

// Checks the form. Returns an object of error messages (empty object = valid).
export function validateTicketInput({ name, category, description }) {
  const errors = {};
  const n = (name || "").trim();
  const d = (description || "").trim();
  if (!n) errors.name = "Please enter your name.";
  else if (n.length > LIMITS.name) errors.name = `Name must be ${LIMITS.name} characters or fewer.`;
  if (!CATEGORIES.includes(category)) errors.category = "Please choose an issue category.";
  if (!d) errors.description = "Please describe the issue.";
  else if (d.length < LIMITS.minDescription)
    errors.description = `Please add a little more detail (at least ${LIMITS.minDescription} characters).`;
  else if (d.length > LIMITS.description)
    errors.description = `Description must be ${LIMITS.description} characters or fewer.`;
  return errors;
}

// Builds a brand-new ticket with an automatic ID, timestamp, and "Open" status.
export function buildTicket(input, existingTickets, now = new Date()) {
  const stamp = now.toISOString();
  return {
    id: generateTicketId(existingTickets),
    name: input.name.trim(),
    category: input.category,
    description: input.description.trim(),
    status: "Open",
    createdAt: stamp,
    updatedAt: stamp,
  };
}

// Returns a copy of the ticket list with one ticket's status changed.
export function applyStatusChange(tickets, id, newStatus, now = new Date()) {
  if (!STATUSES.includes(newStatus)) throw new Error("Invalid status: " + newStatus);
  const found = tickets.some((t) => t.id === id);
  if (!found) throw new Error("Ticket not found: " + id);
  return tickets.map((t) =>
    t.id === id ? { ...t, status: newStatus, updatedAt: now.toISOString() } : t
  );
}

// Filters by status and by search text (ID, name, category, or description).
export function filterTickets(tickets, { status = "All", search = "" } = {}) {
  const q = search.trim().toLowerCase();
  return tickets.filter((t) => {
    if (status !== "All" && t.status !== status) return false;
    if (!q) return true;
    return [t.id, t.name, t.category, t.description].some((v) => v.toLowerCase().includes(q));
  });
}

// Newest tickets first.
export function sortNewestFirst(tickets) {
  return [...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function countByStatus(tickets) {
  const counts = { Open: 0, "In Progress": 0, Resolved: 0 };
  tickets.forEach((t) => {
    if (counts[t.status] !== undefined) counts[t.status] += 1;
  });
  return counts;
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
