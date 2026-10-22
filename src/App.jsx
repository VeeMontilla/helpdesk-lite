import { useCallback, useEffect, useState } from "react";
import TicketForm from "./components/TicketForm.jsx";
import TicketDashboard from "./components/TicketDashboard.jsx";
import TicketDetail from "./components/TicketDetail.jsx";
import SignIn from "./components/SignIn.jsx";
import SetupNotice from "./components/SetupNotice.jsx";
import Toast from "./components/Toast.jsx";
import { configProblem } from "./lib/supabaseClient.js";
import {
  checkIsTechnician,
  getSession,
  onAuthChange,
  signIn,
  signOut,
} from "./services/authService.js";
import {
  STORAGE_MODE,
  createTicket,
  listTickets,
  updateTicketStatus,
} from "./services/ticketService.js";

export default function App() {
  // If the Supabase settings are missing or unsafe, show setup help instead of the app.
  if (configProblem) return <SetupNotice problem={configProblem} />;
  return <HelpDeskApp />;
}

function HelpDeskApp() {
  // session: undefined = still checking, null = signed out, object = signed in
  const [session, setSession] = useState(undefined);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  // access: "none" = not checked yet, "technician" = allowed in,
  //         "denied" = signed in but not on the technician list, "failed" = could not check
  const [access, setAccess] = useState("none");
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState("");
  // view is one of: "dashboard", "new", "detail"
  const [view, setView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState("");
  const closeToast = useCallback(() => setToast(""), []);

  // Find out who is signed in, and keep listening for sign-in / sign-out.
  useEffect(() => {
    let active = true;
    getSession()
      .then((s) => active && setSession(s))
      .catch(() => active && setSession(null));
    const stopListening = onAuthChange((s) => setSession(s));
    return () => {
      active = false;
      stopListening();
    };
  }, []);

  // When someone signs in, check they are on the technician list, then load tickets.
  // When they sign out, forget everything.
  const userId = session?.user?.id ?? null;
  useEffect(() => {
    if (!userId) {
      setTickets([]);
      setAccess("none");
      return undefined;
    }
    let active = true;
    setLoading(true);
    setError("");
    setAccess("none");
    (async () => {
      try {
        if (!(await checkIsTechnician())) {
          if (active) setAccess("denied");
          return;
        }
        const list = await listTickets();
        if (active) {
          setTickets(list);
          setAccess("technician");
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setAccess("failed");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, attempt]);

  async function handleSignIn(email, password) {
    await signIn(email, password);
    setView("dashboard");
    setToast("Signed in successfully.");
  }

  async function handleSignOut() {
    try {
      await signOut();
      setView("dashboard");
      setSelectedId(null);
      setError("");
      setToast("You have been signed out.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(input) {
    try {
      const created = await createTicket(input);
      setTickets(await listTickets());
      setSelectedId(created.id);
      setView("detail");
      setToast(`Ticket ${created.id} was submitted successfully. Status: Open.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleChangeStatus(id, newStatus) {
    try {
      const updated = await updateTicketStatus(id, newStatus);
      setTickets(await listTickets());
      setToast(`Ticket ${updated.id} updated to "${updated.status}".`);
    } catch (err) {
      setError(err.message);
    }
  }

  function goDashboard() {
    setView("dashboard");
    setSelectedId(null);
  }

  const signedIn = Boolean(session);
  const selected = tickets.find((t) => t.id === selectedId);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <button type="button" className="brand" onClick={goDashboard}>
            <span className="brand-mark" aria-hidden="true">
              HD
            </span>
            HelpDesk Lite
          </button>
          {signedIn && (
            <nav className="nav" aria-label="Main">
              {access === "technician" && (
                <>
                  <button
                    type="button"
                    className={"nav-btn" + (view === "dashboard" ? " is-active" : "")}
                    onClick={goDashboard}
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    className={"nav-btn" + (view === "new" ? " is-active" : "")}
                    onClick={() => setView("new")}
                  >
                    New ticket
                  </button>
                </>
              )}
              <span className="session">
                <span className="session-email">{session.user.email}</span>
                <button type="button" className="btn btn-secondary btn-small" onClick={handleSignOut}>
                  Sign out
                </button>
              </span>
            </nav>
          )}
        </div>
      </header>

      <div className="banner" role="note">
        <strong>Demo mode.</strong> Storage: {STORAGE_MODE}. All tickets are fictional sample data.
      </div>

      <Toast message={toast} onClose={closeToast} />

      <main className="main">
        {error && (
          <div className="alert" role="alert">
            {error}{" "}
            <button type="button" className="btn btn-link inline" onClick={() => setError("")}>
              Dismiss
            </button>
          </div>
        )}
        {session === undefined ? (
          <p className="muted">Checking sign-in…</p>
        ) : !signedIn ? (
          <SignIn onSignIn={handleSignIn} />
        ) : access === "denied" ? (
          <section className="card form-card">
            <h2>Not set up as a technician</h2>
            <p>
              You are signed in as <strong>{session.user.email}</strong>, but this account is not on
              the HelpDesk Lite technician list, so it cannot see or change tickets.
            </p>
            <p className="muted">Ask the project owner to add this account in Supabase.</p>
            <div className="actions">
              <button type="button" className="btn btn-secondary" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </section>
        ) : access === "failed" ? (
          <section className="card form-card">
            <h2>Could not load HelpDesk Lite</h2>
            <p className="muted">Check your connection, then try again.</p>
            <div className="actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setAttempt((n) => n + 1)}
              >
                Try again
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </section>
        ) : loading || access !== "technician" ? (
          <p className="muted">Loading tickets…</p>
        ) : view === "new" ? (
          <TicketForm onSubmit={handleSubmit} onCancel={goDashboard} />
        ) : view === "detail" ? (
          <TicketDetail ticket={selected} onBack={goDashboard} onChangeStatus={handleChangeStatus} />
        ) : (
          <TicketDashboard
            tickets={tickets}
            onNew={() => setView("new")}
            onView={(id) => {
              setSelectedId(id);
              setView("detail");
            }}
          />
        )}
      </main>
    </div>
  );
}
