
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import logo from "../assets/contacthub-lockup-dark.svg";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showFavorites, setShowFavorites] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const userName = user?.full_name || "User";
  const userEmail = user?.email || "";

  async function loadContacts() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/contacts");
      const data = response.data;

      setContacts(
        Array.isArray(data) ? data : data.contacts || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load contacts."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContacts();
  }, []);

  const favoritesCount = contacts.filter(
    (contact) => contact.is_favorite
  ).length;

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = contacts.filter((contact) => {
      const matchesSearch = [
        contact.full_name,
        contact.email,
        contact.phone,
        contact.company_name,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return (
        matchesSearch &&
        (!showFavorites || contact.is_favorite)
      );
    });

    result.sort((a, b) => {
      if (sortBy === "name") {
        return (a.full_name || "").localeCompare(b.full_name || "");
      }

      if (sortBy === "name-desc") {
        return (b.full_name || "").localeCompare(a.full_name || "");
      }

      if (sortBy === "newest") {
        return (
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
        );
      }

      return 0;
    });

    return result;
  }, [contacts, search, sortBy, showFavorites]);

  async function toggleFavorite(contact) {
    try {
      setError("");
      await api.patch(`/contacts/${contact._id}/favorite`);
      await loadContacts();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update favorite."
      );
    }
  }

  async function deleteContact(contact) {
    if (!window.confirm(`Delete ${contact.full_name}?`)) return;

    try {
      setError("");
      await api.delete(`/contacts/${contact._id}`);

      setContacts((previous) =>
        previous.filter((item) => item._id !== contact._id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete contact."
      );
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  const navigationItems = [
    { label: "Dashboard", icon: "▦", path: "/dashboard" },
    { label: "Contacts", icon: "▣", path: "/contacts" },
    { label: "Favorites", icon: "☆", path: "/favorites" },
    { label: "Groups", icon: "♧", path: "/groups" },
    { label: "Import", icon: "⇥", path: "/import" },
    { label: "Settings", icon: "⚙", path: "/settings" },
  ];

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-profile">
          <div className="profile-avatar">
            {userName
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase()}
          </div>

          <strong>{userName}</strong>
          <span>{userEmail}</span>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <button
              type="button"
              key={item.label}
              className={`sidebar-link ${
                location.pathname === item.path ||
                (item.label === "Contacts" &&
                  location.pathname === "/dashboard")
                  ? "sidebar-link-active"
                  : ""
              }`}
              onClick={() => {
                setSidebarOpen(false);

                if (item.label === "Favorites") {
                  navigate("/dashboard");
                  setShowFavorites(true);
                } else if (item.label === "Contacts") {
                  setShowFavorites(false);
                  navigate("/dashboard");
                } else {
                  navigate(item.path);
                }
              }}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <span className="sidebar-icon">⇥</span>
          Log out
        </button>
      </aside>

      <main className="contacts-main">
        <header className="contacts-header">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            ☰
          </button>

          <div className="contacts-heading">
            <h1>Contacts</h1>
          </div>

          <img
            src={logo}
            alt="ContactHub logo"
            className="contacts-logo"
          />
        </header>

        <section className="contacts-stats">
          <article className="stat-card">
            <span>Total</span>
            <strong>{contacts.length}</strong>
          </article>

          <article className="stat-card">
            <span>Favorites</span>
            <strong>{favoritesCount}</strong>
          </article>
        </section>

        <section className="contacts-toolbar">
          <input
            className="contact-search"
            type="search"
            placeholder="Search contacts"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button
            type="button"
            className="add-contact-button"
            onClick={() => navigate("/contacts/new")}
          >
            + Add
          </button>
        </section>

        <section className="contact-filters">
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort contacts"
          >
            <option value="name">A-Z</option>
            <option value="name-desc">Z-A</option>
            <option value="newest">Newest first</option>
          </select>

          <button
            type="button"
            className={`filter-button ${
              showFavorites ? "active-filter" : ""
            }`}
            onClick={() => setShowFavorites((value) => !value)}
          >
            {showFavorites ? "Show all contacts" : "Favorites only"}
          </button>
        </section>

        {error && (
          <p className="contacts-error" role="alert">{error}</p>
        )}

        {loading ? (
          <p className="contacts-message">Loading contacts...</p>
        ) : filteredContacts.length === 0 ? (
          <p className="contacts-message">
            {search || showFavorites
              ? "No contacts found."
              : "No contacts yet. Add your first contact!"}
          </p>
        ) : (
          <section className="contact-list">
            {filteredContacts.map((contact) => {
              const initials = (contact.full_name || "?")
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase();

              return (
                <article className="contact-row" key={contact._id}>
                  <div className="contact-avatar">{initials}</div>

                  <div className="contact-details">
                    <strong>{contact.full_name}</strong>
                    <span>{contact.email}</span>
                  </div>

                  <button
                    type="button"
                    className={`row-favorite ${
                      contact.is_favorite ? "is-favorite" : ""
                    }`}
                    aria-label={`Toggle favorite for ${contact.full_name}`}
                    onClick={() => toggleFavorite(contact)}
                  >
                    {contact.is_favorite ? "★" : "☆"}
                  </button>

                  <button
                    type="button"
                    className="row-action"
                    title="Edit contact"
                    aria-label={`Edit ${contact.full_name}`}
                    onClick={() =>
                      navigate(`/contacts/edit/${contact._id}`)
                    }
                  >
                    ✎
                  </button>

                  <button
                    type="button"
                    className="row-action"
                    title="Delete contact"
                    aria-label={`Delete ${contact.full_name}`}
                    onClick={() => deleteContact(contact)}
                  >
                    ♧
                  </button>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
