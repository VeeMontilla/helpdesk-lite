import { useMemo, useState } from "react";
import StatusBadge from "./StatusBadge.jsx";
import {
  STATUSES,
  countByStatus,
  filterTickets,
  formatDateTime,
  sortNewestFirst,
} from "../lib/ticketLogic.js";

export default function TicketDashboard({ tickets, onView, onNew }) {
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => countByStatus(tickets), [tickets]);
  const visible = useMemo(
    () => sortNewestFirst(filterTickets(tickets, { status, search })),
    [tickets, status, search]
  );

  return (
    <section>
      <div className="page-head">
        <div>
          <h2>Ticket dashboard</h2>
          <p className="muted">{tickets.length} total tickets</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onNew}>
          + New ticket
        </button>
      </div>

      <div className="summary">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={"summary-item" + (status === s ? " is-active" : "")}
            onClick={() => setStatus(status === s ? "All" : s)}
            aria-pressed={status === s}
          >
            <span className="summary-count">{counts[s]}</span>
            <span className="summary-label">{s}</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="field grow">
          <label htmlFor="search" className="sr-only">
            Search tickets
          </label>
          <input
            id="search"
            type="search"
            placeholder="Search tickets (ID, name, issue)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="statusFilter" className="sr-only">
            Filter by status
          </label>
          <select id="statusFilter" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="All">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card empty">
          <p>No tickets match your filters.</p>
        </div>
      ) : (
        <>
          {/* Table for wider screens */}
          <div className="card table-wrap">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => (
                  <tr key={t.id}>
                    <td className="mono">{t.id}</td>
                    <td>{t.name}</td>
                    <td>{t.category}</td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td>{formatDateTime(t.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => onView(t.id)}
                        aria-label={`View ticket ${t.id}`}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards for phones */}
          <ul className="ticket-cards">
            {visible.map((t) => (
              <li key={t.id}>
                <button type="button" className="card ticket-card" onClick={() => onView(t.id)}>
                  <div className="ticket-card-top">
                    <span className="mono">{t.id}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <strong>{t.category}</strong>
                  <span className="muted">
                    {t.name} · {formatDateTime(t.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
