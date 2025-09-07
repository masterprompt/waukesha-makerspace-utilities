import { Outlet } from "react-router-dom";
import NavBar from "@components/NavBar";
import { Container } from "@mui/material";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateRows: "auto 1fr" }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </div>
  );
}