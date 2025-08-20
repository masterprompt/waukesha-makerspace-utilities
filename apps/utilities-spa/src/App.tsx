import { Outlet } from "react-router-dom";
import NavBar from "@components/NavBar";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateRows: "auto 1fr" }}>
      <NavBar />
      <main style={{ padding: "1rem", maxWidth: 1000, margin: "0 auto" }}>
        <Outlet />
      </main>
    </div>
  );
}