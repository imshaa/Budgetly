import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import  { Layout }  from './components/Layout';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Insights } from './pages/Insights';
import { SavingsGoal } from './pages/SavingsGoal';
import { Settings } from './pages/Settings';
import { AIChat } from './pages/AIChat';
import { Onboarding } from './pages/Onboarding';



// ── Guard: redirect to /login if not authenticated ───────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return <>{children}</>;
}

// ── Guard: redirect to /dashboard if already authenticated ───────────────────
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      {/* Profile & Onboarding — auth required but no sidebar layout */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* Main app — auth required, uses sidebar Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/savings" element={<SavingsGoal />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/chat" element={<AIChat />} />
      </Route>

      {/* Catch-all */}
      {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CurrencyProvider>
          <AppRoutes />
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}



// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { CurrencyProvider } from './contexts/CurrencyContext';
// import { Layout } from './components/Layout';
// import { Login } from './pages/Login';
// import { Profile } from './pages/Profile';
// import { Onboarding } from './pages/Onboarding';
// import { Dashboard } from './pages/Dashboard';
// import { LandingPage } from './pages/LandingPage'
// import { AIChat } from './pages/AIChat';
// import { SavingsGoal } from './pages/SavingsGoal';
// import { Transactions } from './pages/Transactions';
// import { Insights } from './pages/Insights';
// import { Settings } from './pages/Settings';
// export function App() {
//   return (
//     <CurrencyProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/profile" element={<Profile />} />

//           {/* Routes with Sidebar Layout */}
//           <Route element={<Layout />}>
//             <Route path="/onboarding" element={<Onboarding />} />
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/chat" element={<AIChat />} />
//             <Route path="/savings" element={<SavingsGoal />} />
//             <Route path="/transactions" element={<Transactions />} />
//             <Route path="/insights" element={<Insights />} />
//             <Route path="/settings" element={<Settings />} />
//           </Route>

//           <Route path="*" element={<Navigate to="/login" replace />} />
//         </Routes>
//       </BrowserRouter>
//     </CurrencyProvider>);

// }