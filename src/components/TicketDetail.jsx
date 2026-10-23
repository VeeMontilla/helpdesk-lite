import StatusBadge from "./StatusBadge.jsx";
import { STATUSES, formatDateTime } from "../lib/ticketLogic.js";

export default function TicketDetail({ ticket, onBack, onChangeStatus }) {
  if (!ticket) {
    return (
      <section className="card empty">
        <p>That ticket could not be found.</p>
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          Back to dashboard
        </button>
      </section>
    );
  }

  return (
    <section>
      <button type="button" className="btn btn-link back" onClick={onBack}>
        ← Back to dashboard
      </button>

      <div className="card detail">
        <div className="detail-head">
          <div>
            <p className="mono muted">{ticket.id}</p>
            <h2>{ticket.category}</h2>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        <dl className="detail-grid">
          <div>
            <dt>Submitted by</dt>
            <dd>{ticket.name}</dd>
          </div>
          <div>
            <dt>Submitted</dt>
            <dd>{formatDateTime(ticket.createdAt)}</dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>{formatDateTime(ticket.updatedAt)}</dd>
          </div>
        </dl>

        <h3>Description</h3>
        <p className="description">{ticket.description}</p>

        <div className="status-panel">
          <label htmlFor="status">Technician: update status</label>
          <div className="status-row">
            <select
              id="status"
              value={ticket.status}
              onChange={(e) => onChangeStatus(ticket.id, e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <p className="muted small">Changing the status saves it right away.</p>
        </div>
      </div>
    </section>
  );
}
