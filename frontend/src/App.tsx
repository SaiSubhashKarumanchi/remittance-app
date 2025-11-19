import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SendMoneyPage from './pages/SendMoneyPage';
import TransfersPage from './pages/TransfersPage';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" replace />;
}

function Shell({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const showNav = token && !['/login', '/register'].includes(location.pathname);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #1e293b 0, #020617 50%, #000000 100%)'
      }}
    >
      {showNav && (
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Kubex
            </Typography>
            <Button color="inherit" onClick={() => navigate('/send')}>
              Send Money
            </Button>
            <Button color="inherit" onClick={() => navigate('/transfers')}>
              Transfers
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      )}
      <Container maxWidth="sm" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={(
          <Shell>
            <LoginPage />
          </Shell>
        )}
      />
      <Route
        path="/register"
        element={(
          <Shell>
            <RegisterPage />
          </Shell>
        )}
      />
      <Route
        path="/send"
        element={(
          <Shell>
            <PrivateRoute>
              <SendMoneyPage />
            </PrivateRoute>
          </Shell>
        )}
      />
      <Route
        path="/transfers"
        element={(
          <Shell>
            <PrivateRoute>
              <TransfersPage />
            </PrivateRoute>
          </Shell>
        )}
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
