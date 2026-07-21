import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./features/auth/pages/AuthPage";
import { AppLayout } from "./shared/components/AppLayout";
import { GroupsListPage } from "./features/groups/pages/GroupsListPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("accessToken"),
  );

  if (!isAuthenticated) {
    return <AuthPage onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/groups" replace />} />
          <Route path="/groups" element={<GroupsListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
