import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('demo@quickli.dev');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // For this demo we use a simple credential check.
    // In full Better Auth implementation you would call authClient.signIn.email()
    if (email === 'demo@quickli.dev' && password === 'demo1234') {
      // Set a simple session cookie or localStorage flag for demo
      document.cookie = 'demo-auth=true; path=/; max-age=86400';
      toast.success('Welcome back!');
      router.push('/dashboard');
    } else {
      toast.error('Invalid credentials. Use the seeded demo account.');
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Login • Quickli Fact Find</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-quickli-light px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-quickli-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">Q</span>
              </div>
              <span className="font-semibold text-2xl tracking-tight text-quickli-primary">Quickli</span>
            </div>
            <h1 className="text-2xl font-semibold text-quickli-primary">Broker Fact Find</h1>
            <p className="text-quickli-muted mt-1">Sign in to manage your client fact finds</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full mt-2"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-quickli-muted">
              Demo account pre-seeded: <br />
              <span className="font-mono">demo@quickli.dev / demo1234</span>
            </div>
          </div>

          <p className="text-center text-xs text-quickli-muted mt-6">
            This is a focused vertical slice for the Product Engineering Challenge
          </p>
        </div>
      </div>
    </>
  );
}
