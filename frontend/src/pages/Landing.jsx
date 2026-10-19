
import { Link } from "react-router-dom";
import logo from "../assets/contacthub-lockup-dark.svg";
import "./Landing.css";

function Landing() {
  return (
    <div className="landing-page">
      <nav className="landing-navbar">
        <img
          src={logo}
          alt="ContactHub logo"
          className="landing-logo"
        />

        <div className="landing-nav-actions">
          <Link to="/login" className="landing-login-link">
            Log in
          </Link>

          <Link to="/register" className="landing-register-button">
            Register
          </Link>
        </div>
      </nav>

      <main className="landing-hero">
        

        <p className="landing-eyebrow">
          WELCOME TO CONTACTHUB
        </p>

        <h1>
          Your contacts.
          <br />
          <span>Your space. Your control.</span>
        </h1>

        <p className="landing-description">
          Keep your contacts and important information organized
          in one place. Create your account to get started and
          manage your contacts with ease.
        </p>

        <div className="landing-actions">
          <Link to="/register" className="landing-primary-button">
            Get Started — Register
          </Link>
          <Link to="/login" className="landing-secondary-button">
            Already have an account? Log in
          </Link>
        </div>

        <div className="landing-benefits">
          <div>
            <span>✓</span>
            Organized contacts
          </div>
          <div>
            <span>✓</span>
            Easy access
          </div>
          <div>
            <span>✓</span>
            Account-based access
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        © {new Date().getFullYear()} ContactHub. Your contacts,
        organized.
      </footer>
    </div>
  );
}

export default Landing;
