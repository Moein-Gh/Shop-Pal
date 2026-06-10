import { useAtomValue } from "jotai";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { authAtom } from "./atoms/auth";
import AuthPage from "./pages/AuthPage";
import ListsPage from "./pages/ListsPage";
import ItemDetailPage from "./pages/ItemDetailPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAtomValue(authAtom);
  if (!auth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ListsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/:itemId"
          element={
            <ProtectedRoute>
              <ItemDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
