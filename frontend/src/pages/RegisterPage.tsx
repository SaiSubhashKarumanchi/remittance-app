import { useState } from 'react';
import { Box, Button, TextField, Typography, Link as MuiLink } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await register(email, password);
      localStorage.setItem('authToken', res.token);
      navigate('/send');
    } catch (err) {
      setError('Unable to register with this email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" component="h1" textAlign="center">
        Sign up
      </Typography>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        fullWidth
      />
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      <Button type="submit" variant="contained" fullWidth disabled={loading}>
        {loading ? 'Signing up...' : 'Create account'}
      </Button>
      <Typography variant="body2" textAlign="center">
        Already have an account?{' '}
        <MuiLink component={Link} to="/login">
          Sign in
        </MuiLink>
      </Typography>
    </Box>
  );
}

export default RegisterPage;
