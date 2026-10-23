import { useState } from "react";
import { CATEGORIES, LIMITS, validateTicketInput } from "../lib/ticketLogic.js";

export default function TicketForm({ onSubmit, onCancel }) {
  const [values, setValues] = useState({ name: "", category: "", description: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validateTicketInput(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card form-card">
      <h2>Submit a support request</h2>
      <p className="muted">Tell us what is wrong and a technician will pick it up.</p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={values.name}
            onChange={handleChange}
            maxLength={LIMITS.name}
            autoComplete="off"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p className="error" id="name-error">
              {errors.name}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="category">Issue category</label>
          <select
            id="category"
            name="category"
            value={values.category}
            onChange={handleChange}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? "category-error" : undefined}
          >
            <option value="">Select a category…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="error" id="category-error">
              {errors.category}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="description">Describe the issue</label>
          <textarea
            id="description"
            name="description"
            rows={6}
            value={values.description}
            onChange={handleChange}
            maxLength={LIMITS.description}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "description-error" : "description-count"}
          />
          <div className="field-meta">
            {errors.description ? (
              <p className="error" id="description-error">
                {errors.description}
              </p>
            ) : (
              <span />
            )}
            <span className="muted small" id="description-count">
              {values.description.length}/{LIMITS.description}
            </span>
          </div>
        </div>

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit ticket"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
