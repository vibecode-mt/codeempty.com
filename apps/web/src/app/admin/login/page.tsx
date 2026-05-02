'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@codeempty.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(\\/api/admin/login\, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminEmail', data.user.email);
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='login-container'>
      <div className='login-box'>
        <h1>CodeEmpty.com Admin</h1>
        <p>Sign in to manage your content</p>
        {error && <div className='error-message'>{error}</div>}
        <form onSubmit={handleLogin}>
          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder='Your GUID from setup'
            />
          </div>
          <button type='submit' disabled={loading} className='btn-primary'>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className='help-text'>First time? Use your GUID password from setup. Change it immediately after login.</p>
      </div>
      <style jsx>{\
        .login-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .login-box { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
        h1 { margin: 0 0 10px; text-align: center; font-size: 28px; }
        p { text-align: center; color: #666; margin-bottom: 30px; }
        .error-message { background: #fee; color: #c33; padding: 12px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #c33; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: 500; }
        input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box; }
        input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        input:disabled { background: #f5f5f5; cursor: not-allowed; }
        .btn-primary { width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.3s; }
        .btn-primary:hover:not(:disabled) { background: #5568d3; }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .help-text { font-size: 13px; color: #999; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
      \}</style>
    </main>
  );
}
