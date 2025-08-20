import { NavLink } from "react-router-dom";

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
  padding: "0.5rem 0.75rem",
  borderRadius: 8
};

const active: React.CSSProperties = {
  background: "rgba(0,0,0,0.08)"
};

export default function NavBar() {
  return (
    <header style={{
      borderBottom: "1px solid rgba(0,0,0,0.1)",
      padding: "0.75rem 1rem",
      display: "flex",
      gap: 8,
      alignItems: "center",
      justifyContent: "space-between"
    }}>
      <strong>Utilities SPA</strong>
      <nav style={{ display: "flex", gap: 4 }}>
        <NavLink to="/" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? active : {}) })}>Home</NavLink>
        <NavLink to="/events" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? active : {}) })}>Events</NavLink>
        <NavLink to="/duplicate" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? active : {}) })}>Duplicate</NavLink>
        <NavLink to="/settings" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? active : {}) })}>Settings</NavLink>
      </nav>
    </header>
  );
}