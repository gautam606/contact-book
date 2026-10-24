
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/contacthub-lockup-dark.svg";
import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }


async function handleSubmit(e) {
  e.preventDefault();

  setError("");

  if (!formData.email.trim() || !formData.password) {
    setError("Please enter your email and password.");
    return;
  }

  try {
    setLoading(true);

    const response = await api.post("/auth/login", {
      email: formData.email.trim(),
      password: formData.password,
    });

    const data = response.data;

    if (!data.token) {
      throw new Error("Login succeeded, but no token was received.");
    }

    // Save the token for authenticated API requests.
    sessionStorage.setItem("token", data.token);

    if (data.user) {
      sessionStorage.setItem("user", JSON.stringify(data.user));
    }

    navigate("/dashboard", { replace: true });
  } catch (err) {
    const message =
      err.response?.data?.message ||
      (err.code === "ERR_NETWORK"
        ? "Cannot connect to the server. Please check your backend."
        : err.message || "Login failed.");

    setError(message);
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src={logo} alt="ContactHub logo" />
        </div>

        <h2>Welcome back</h2>

        <p className="login-subtitle">
          Sign in to manage your contacts
        </p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Password</label>

            <div className="login-password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="login-show-password"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="login-register-link">
          Don't have an account?{" "}
          <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
