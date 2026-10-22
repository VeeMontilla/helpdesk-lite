// Run with: npm test
// These tests check the ticket rules in src/lib/ticketLogic.js.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyStatusChange,
  buildTicket,
  countByStatus,
  filterTickets,
  generateTicketId,
  sortNewestFirst,
  validateTicketInput,
} from "../src/lib/ticketLogic.js";
import { SAMPLE_TICKETS } from "../src/data/sampleTickets.js";

const valid = {
  name: "Test User",
  category: "Hardware",
  description: "My fictional monitor shows no signal.",
};

test("first ticket ID is HD-0001 when there are no tickets", () => {
  assert.equal(generateTicketId([]), "HD-0001");
});

test("next ID follows the highest existing ID", () => {
  assert.equal(generateTicketId(SAMPLE_TICKETS), "HD-0006");
});

test("new ticket IDs are unique across several submissions", () => {
  let list = [...SAMPLE_TICKETS];
  const ids = new Set(list.map((t) => t.id));
  for (let i = 0; i < 20; i++) {
    const t = buildTicket(valid, list);
    assert.ok(!ids.has(t.id), "duplicate id " + t.id);
    ids.add(t.id);
    list = [...list, t];
  }
  assert.equal(ids.size, 25);
});

test("new ticket starts Open with matching timestamps", () => {
  const now = new Date("2026-10-20T12:00:00Z");
  const t = buildTicket(valid, [], now);
  assert.equal(t.status, "Open");
  assert.equal(t.createdAt, "2026-10-20T12:00:00.000Z");
  assert.equal(t.updatedAt, t.createdAt);
});

test("ticket text is trimmed", () => {
  const t = buildTicket({ ...valid, name: "  Spacey  " }, []);
  assert.equal(t.name, "Spacey");
});

test("validation accepts good input", () => {
  assert.deepEqual(validateTicketInput(valid), {});
});

test("validation rejects empty fields", () => {
  const errors = validateTicketInput({ name: "  ", category: "", description: "" });
  assert.ok(errors.name && errors.category && errors.description);
});

test("validation rejects a too-short description", () => {
  const errors = validateTicketInput({ ...valid, description: "help" });
  assert.ok(errors.description);
});

test("validation rejects an unknown category", () => {
  assert.ok(validateTicketInput({ ...valid, category: "Weather" }).category);
});

test("status change updates only the chosen ticket and its updatedAt", () => {
  const now = new Date("2026-10-21T08:00:00Z");
  const result = applyStatusChange(SAMPLE_TICKETS, "HD-0001", "In Progress", now);
  const changed = result.find((t) => t.id === "HD-0001");
  assert.equal(changed.status, "In Progress");
  assert.equal(changed.updatedAt, "2026-10-21T08:00:00.000Z");
  assert.equal(changed.createdAt, SAMPLE_TICKETS[0].createdAt);
  const others = result.filter((t) => t.id !== "HD-0001");
  assert.deepEqual(
    others,
    SAMPLE_TICKETS.filter((t) => t.id !== "HD-0001")
  );
});

test("status change does not modify the original list", () => {
  const before = JSON.stringify(SAMPLE_TICKETS);
  applyStatusChange(SAMPLE_TICKETS, "HD-0002", "Resolved");
  assert.equal(JSON.stringify(SAMPLE_TICKETS), before);
});

test("status change rejects invalid status and unknown ticket", () => {
  assert.throws(() => applyStatusChange(SAMPLE_TICKETS, "HD-0001", "Done"));
  assert.throws(() => applyStatusChange(SAMPLE_TICKETS, "HD-9999", "Open"));
});

test("filter by status and by search text", () => {
  assert.equal(filterTickets(SAMPLE_TICKETS, { status: "Open" }).length, 2);
  assert.equal(filterTickets(SAMPLE_TICKETS, { search: "printer" }).length, 1);
  assert.equal(filterTickets(SAMPLE_TICKETS, { search: "hd-0003" })[0].name, "Marcus Webb");
  assert.equal(filterTickets(SAMPLE_TICKETS, { status: "All", search: "" }).length, 5);
});

test("sort puts newest first", () => {
  const sorted = sortNewestFirst(SAMPLE_TICKETS);
  assert.equal(sorted[0].id, "HD-0005");
  assert.equal(sorted[sorted.length - 1].id, "HD-0003");
});

test("counts by status match the sample data", () => {
  assert.deepEqual(countByStatus(SAMPLE_TICKETS), { Open: 2, "In Progress": 2, Resolved: 1 });
});
