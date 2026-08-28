// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // guards against double-submit
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/');
    } catch (err) {
      if (err?.type === 'validation') {
        setError(Object.values(err.errors).flat().join(' '));
      } else if (err?.status === 401) {
        setError('Incorrect phone number or password.');
      } else if (err?.status === 429) {
        setError('Too many attempts — please wait a minute and try again.');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ivory">
      <div className="hidden lg:flex flex-col justify-between bg-midnight-950 text-ivory px-14 py-12">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-400 text-midnight-950 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-serif text-2xl">Kandura Store</span>
        </Link>
        <div>
          <p className="eyebrow mb-4">Bespoke tailoring, online</p>
          <h1 className="font-serif text-5xl leading-[1.1] mb-4">Your kandura, drafted to the last stitch.</h1>
          <p className="text-midnight-300 max-w-md leading-relaxed">
            Choose a fabric, a collar, a sleeve — set your size — and we cut it to order.
          </p>
        </div>
        <p className="text-xs text-midnight-500">&copy; {new Date().getFullYear()} Kandura Store</p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl text-midnight-900 mb-2">Welcome back.</h1>
          <p className="text-sm text-midnight-400 mb-8">Sign in to your atelier account.</p>

          {error && (
            <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl mb-5 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="field-label" htmlFor="phone">Phone number</label>
              <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="field-input" placeholder="+971 5X XXX XXXX" autoComplete="tel" />
            </div>
            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="field-input" placeholder="Enter your password" autoComplete="current-password" />
            </div>
            <button disabled={loading} className="btn-gold w-full">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-midnight-400 mt-6">
            Don't have an account? <Link to="/register" className="text-gold-600 font-semibold">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
