import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { isValidEmail, validatePassword } from '../utils/validators';

export function SignupPage() {
  const { signup, user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email');
      return;
    }
    const pwErr = validatePassword(password);
    if (pwErr) {
      setError(pwErr);
      return;
    }
    setLoading(true);
    try {
      await signup({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Create account</h1>
      <p className="mt-1 text-sm text-slate-400">Join WashGo in under a minute.</p>
      <form className="mt-8 space-y-4" onSubmit={submit}>
        <Input label="Full name" name="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Phone (optional)" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          passwordToggle
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <Button type="submit" className="w-full" loading={loading}>
          Sign up
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300">
          Log in
        </Link>
      </p>
    </div>
  );
}
