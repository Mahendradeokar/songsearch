import { useEffect } from "react";
import type { ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router";
import { useUserStore } from "./store/user-store";
import Signup from "./page/signup";
import Login from "./page/login";
import SongSearch from "./page/song-search";
import Navbar from "./components/navbar";
import PlaylistPage from "./page/playlist";
import PlaylistShareView from "./page/playlist-share-view";
import { getUser } from "./lib/request/auth-requests";
import { Loading } from "./components/loading";
import { clearAuthToken, getAuthToken } from "./lib/utils";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useUserStore((state) => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function ProtectedLayout() {
  const setUser = useUserStore((state) => state.setUser);
  const setStatus = useUserStore((state) => state.setStatus);
  const setReason = useUserStore((state) => state.setReason);
  const status = useUserStore((state) => state.status);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setStatus("loading");
      const token = getAuthToken();
      if (!token) {
        setStatus("failed");
        setReason("No auth token found");
        navigate("/login");
        return;
      }

      const { error, data } = await getUser();
      if (error) {
        clearAuthToken();
        setStatus("failed");
        setReason(error.detail);
        navigate("/login");
        return;
      }
      setUser(data);
      setStatus("idle");
    })();
  }, [setReason, setStatus, setUser, navigate]);

  if (status === "loading") {
    return (
      <Loading className="flex w-full min-h-screen justify-center items-center" />
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <Outlet />
    </ProtectedRoute>
  );
}

function RedirectIfLoggedIn({ to }: { to: string }) {
  const user = useUserStore((state) => state.user);
  if (user) {
    return <Navigate to={to} replace />;
  }
  return <Outlet />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RedirectIfLoggedIn to="/" />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<SongSearch />} />
          <Route path="/playlist" element={<PlaylistPage />} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />
        </Route>
        <Route path="/playlist/shared/:id" element={<PlaylistShareView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
