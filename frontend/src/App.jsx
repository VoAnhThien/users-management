import { useState } from "react";
import { getUser, clearUser, isAdmin } from "./api";
import Login     from "./pages/Login";
import AdminPage from "./pages/AdminPage";
import UserPage  from "./pages/UserPage";
import "./styles/global.css";

export default function App() {
  const [user, setUser] = useState(() => getUser()); 

  const handleLogin  = (u) => setUser(u);
  const handleLogout = () => { clearUser(); setUser(null); };

  if (!user) return <Login onLogin={handleLogin} />;

  return isAdmin(user)
    ? <AdminPage user={user} onLogout={handleLogout} />
    : <UserPage  user={user} onLogout={handleLogout} />;
}