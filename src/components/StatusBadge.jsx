const CLASS_BY_STATUS = {
  Open: "badge badge-open",
  "In Progress": "badge badge-progress",
  Resolved: "badge badge-resolved",
};

// The text label is always shown (never color alone), so it is readable for everyone.
export default function StatusBadge({ status }) {
  return <span className={CLASS_BY_STATUS[status] || "badge"}>{status}</span>;
}
