import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GamificationProvider } from './contexts/GamificationContext';
import Navbar from './components/Navbar/Navbar';
import FeedbackWidget from './components/FeedbackWidget';
import { MultiplayerProvider } from './contexts/MultiplayerContext';
import { Toaster } from 'react-hot-toast';

// Direct imports (temporarily disable lazy loading for debugging)
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import QuizPage from './pages/QuizPage/QuizPage';
import ShopPage from './pages/ShopPage/ShopPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import AIHelperPage from './pages/AIHelperPage/AIHelperPage';
import MultiplayerPage from './pages/Multiplayer/MultiplayerPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      {user && (
        <>
          <Navbar />
          <FeedbackWidget />
        </>
      )}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--color-background-card)',
            color: 'var(--color-text-primary)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-terracotta)',
              secondary: 'white',
            },
          },
        }}
      />
      <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/learn" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/shop" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/ai-helper" element={<ProtectedRoute><AIHelperPage /></ProtectedRoute>} />
          <Route path="/multiplayer" element={<ProtectedRoute><MultiplayerPage /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GamificationProvider>
          <MultiplayerProvider>
            <AppContent />
          </MultiplayerProvider>
        </GamificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
