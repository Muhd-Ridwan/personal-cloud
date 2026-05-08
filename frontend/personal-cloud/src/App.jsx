import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DriveProvider } from "./context/DriveContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import MyDrivePage from "./pages/MyDrivePage";
import RecentPage from "./pages/RecentPage";
import StarredPage from "./pages/StarredPage";
import TrashPage from "./pages/TrashPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DriveProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/drive" replace />} />
                <Route path="/drive" element={<MyDrivePage />} />
                <Route path="/drive/:folderId" element={<MyDrivePage />} />
                <Route path="/recent" element={<RecentPage />} />
                <Route path="/starred" element={<StarredPage />} />
                <Route path="/trash" element={<TrashPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/drive" replace />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Routes>
        </DriveProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
