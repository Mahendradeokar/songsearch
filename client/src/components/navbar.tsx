import { useUserStore } from "~/store/user-store";
import { Button } from "~/components/ui/button";
import { NavLink, useNavigate } from "react-router";
import { cn } from "~/lib/utils";
import { Search, ListMusic, Disc } from "lucide-react";

const navbarConfig = [
  {
    to: "/",
    label: "Search",
    icon: <Search size={18} />,
  },
  {
    to: "/playlist",
    label: "Playlists",
    icon: <ListMusic size={18} />,
  },
];

function Navbar() {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="w-full bg-background border-b px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-8">
        <NavLink
          to="/"
          className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-primary"
        >
          <Disc size={28} className="text-primary" />
          SongShare
        </NavLink>
        <div className="flex items-center gap-2 ml-6">
          {navbarConfig.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                )
              }
              end={item.to === "/"}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-muted-foreground font-medium px-3 py-1 rounded bg-muted/60">
              {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <NavLink to="/login">
              <Button variant="outline" size="sm" className="mr-1">
                Login
              </Button>
            </NavLink>
            <NavLink to="/signup">
              <Button size="sm">Sign Up</Button>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
