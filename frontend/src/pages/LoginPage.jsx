import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { isValidEmail } from '../utils/validators';

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) {
      setError('Enter a valid email');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Sign in</h1>
      <p className="mt-1 text-sm text-slate-400">Welcome back to WashGo.</p>
      <form className="mt-8 space-y-4" onSubmit={submit}>
        <Input label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          passwordToggle
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <Button type="submit" className="w-full" loading={loading}>
          Continue
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        New here?{' '}
        <Link to="/signup" className="font-semibold text-cyan-400 hover:text-cyan-300">
          Create an account
        </Link>
      </p>
    </div>
  );
}
