// components/AuthForm.tsx
import { useState } from 'react';
import {
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Paper,
} from '@mui/material';
import { authDomain } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(authDomain, email, password);
      } else {
        await signInWithEmailAndPassword(authDomain, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <Paper
        elevation={3}
        className="w-full max-w-md rounded-lg bg-gray-800 p-6"
      >
        <Typography variant="h5" className="mb-4 text-center">
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </Typography>

        <ToggleButtonGroup
          color="primary"
          value={mode}
          exclusive
          onChange={(_, newMode) => newMode && setMode(newMode)}
          fullWidth
        >
          <ToggleButton value="login">Login</ToggleButton>
          <ToggleButton value="signup">Sign Up</ToggleButton>
        </ToggleButtonGroup>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex flex-col space-y-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" variant="contained" fullWidth>
            {mode === 'login' ? 'Login' : 'Create Account'}
          </Button>
        </form>
        {/* Divider */}
        <div className="relative my-4 flex items-center">
          <div className="flex-grow border-t border-gray-500"></div>
          <span className="px-2 text-sm text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-500"></div>
        </div>
        <Button
          onClick={async () => {
            const provider = new GoogleAuthProvider();
            try {
              await signInWithPopup(authDomain, provider);
            } catch (err: any) {
              setError(err.message);
            }
          }}
          fullWidth
          variant="outlined"
        >
          Sign in with Google
        </Button>
      </Paper>
    </div>
  );
}
