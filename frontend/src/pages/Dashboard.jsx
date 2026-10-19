
import { useNavigate } from "react-router-dom";
import logo from "../assets/contacthub-lockup-dark.svg";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const userName = user?.full_name || "there";

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-navbar">
        <img
          src={logo}
          alt="ContactHub logo"
          className="dashboard-logo"
        />

        <button
          type="button"
          className="dashboard-logout"
          onClick={handleLogout}
        >
          Log out
        </button>
      </header>

      <main className="dashboard-content">
        <p className="dashboard-eyebrow">YOUR PERSONAL SPACE</p>

        <h1>Welcome back, {userName}!</h1>

        <p className="dashboard-description">
          Keep your important people organized in one place.
        </p>

        <section className="dashboard-welcome-card">
          <div className="dashboard-icon">👥</div>

          <div>
            <h2>Your contacts, all in one place</h2>
            <p>
              Your ContactHub dashboard is ready. Soon, you'll be
              able to add, view, edit, and manage your contacts here.
            </p>
          </div>
        </section>

        <section className="dashboard-stats">
          <div className="dashboard-stat-card">
            <span>Total contacts</span>
            <h2>0</h2>
            <p>Your saved contacts</p>
          </div>

          <div className="dashboard-stat-card">
            <span>Recently added</span>
            <h2>0</h2>
            <p>Your latest contacts</p>
          </div>
        </section>

        <button
          type="button"
          className="dashboard-add-button"
          onClick={() =>
            alert("We'll add contact management in the next step!")
          }
        >
          + Add your first contact
        </button>
      </main>
    </div>
  );
}

export default Dashboard;
