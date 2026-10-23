// Shown instead of the app when the Supabase settings are missing or unsafe.
export default function SetupNotice({ problem }) {
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand">
            <span className="brand-mark" aria-hidden="true">
              HD
            </span>
            HelpDesk Lite
          </span>
        </div>
      </header>
      <main className="main">
        <section className="card form-card">
          <h2>Supabase setup needed</h2>
          <p className="alert" role="alert">
            {problem}
          </p>
          <ol className="setup-list">
            <li>
              In the project folder, copy <code>.env.example</code> to a new file named{" "}
              <code>.env.local</code>.
            </li>
            <li>
              Replace the two placeholder values with your Supabase project URL and{" "}
              <strong>publishable</strong> key.
            </li>
            <li>Stop the app and start it again (<code>npm run dev</code>).</li>
          </ol>
          <p className="muted small">
            Full steps are in <code>supabase/README.md</code>, Part 2.
          </p>
        </section>
      </main>
    </div>
  );
}
