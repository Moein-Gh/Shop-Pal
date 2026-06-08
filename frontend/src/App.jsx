import { useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
          Shop Pal
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Main app coming soon...
        </p>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.reload();
          }}
          className="mt-8 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;
