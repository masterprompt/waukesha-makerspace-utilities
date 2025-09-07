import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: "inherit",
  textDecoration: "none",
  marginLeft: 8,
  padding: "6px 10px",
  borderRadius: 8,
  background: isActive ? "rgba(255,255,255,0.2)" : "transparent"
});

export default function NavBar() {
  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Utilities SPA
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <NavLink to="/" style={linkStyle as any}><Button color="inherit">Home</Button></NavLink>
            <NavLink to="/events" style={linkStyle as any}><Button color="inherit">Events</Button></NavLink>
            <NavLink to="/duplicate" style={linkStyle as any}><Button color="inherit">Duplicate</Button></NavLink>
            <NavLink to="/settings" style={linkStyle as any}><Button color="inherit">Settings</Button></NavLink>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}