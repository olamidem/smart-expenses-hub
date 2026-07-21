import { useState } from "react";
import { AuthPage } from "./src/features/auth/pages/AuthPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("accessToken"),
  );

  if (!isAuthenticated) {
    return <AuthPage onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-bg text-text p-8">
      <p>Logged in! Groups list goes here next.</p>
    </div>
  );
}

export default App;
