import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react';
import './LandingPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('student@college.edu');
  const [password, setPassword] = useState('student123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.data.role === 'tpo') {
        navigate('/tpo/dashboard');
      } else if (result.data.role === 'student') {
        navigate('/student/dashboard');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="sankalp-landing" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Mini Header */}
      <header style={{
        padding: '1rem 2rem',
        borderBottom: '2px solid var(--sk-ink)',
        background: 'var(--sk-cream-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link to="/" className="sk-logo">
          <div className="sk-logo-icon">
            <GraduationCap size={22} color="#fff" />
          </div>
          <div className="sk-logo-text">
            <span className="sk-logo-name">Sankalp</span>
            <span className="sk-logo-tag">Career Readiness</span>
          </div>
        </Link>
        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--sk-ink)',
          textDecoration: 'none',
          fontSize: '0.88rem',
          fontWeight: 500,
        }}>
          <ArrowLeft size={16} /> Back to home
        </Link>
      </header>

      {/* Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--sk-cream)',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: 'var(--sk-font-display)',
              fontSize: '2.5rem',
              fontWeight: 700,
              margin: '0 0 0.5rem',
              color: 'var(--sk-ink)',
            }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--sk-ink-muted)', fontSize: '1rem' }}>
              Sign in to continue your preparation journey
            </p>
          </div>

          <div style={{
            background: 'var(--sk-cream-light)',
            border: '2px solid var(--sk-ink)',
            borderRadius: 'var(--sk-border-radius)',
            boxShadow: '5px 5px 0 var(--sk-ink)',
            padding: '2.5rem',
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {error && (
                <div style={{
                  background: '#FEF2F2',
                  color: '#DC2626',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  border: '1.5px solid #FECACA',
                }} data-testid="login-error-message">
                  {error}
                </div>
              )}

              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  marginBottom: '8px',
                  color: 'var(--sk-ink)',
                  fontFamily: 'var(--sk-font-display)',
                }}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="login-email-input"
                  placeholder="you@college.edu"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid var(--sk-ink)',
                    borderRadius: '10px',
                    background: 'var(--sk-cream)',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--sk-font-body)',
                    outline: 'none',
                    transition: 'box-shadow 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.boxShadow = '2px 2px 0 var(--sk-ink)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  marginBottom: '8px',
                  color: 'var(--sk-ink)',
                  fontFamily: 'var(--sk-font-display)',
                }}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="login-password-input"
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid var(--sk-ink)',
                    borderRadius: '10px',
                    background: 'var(--sk-cream)',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--sk-font-body)',
                    outline: 'none',
                    transition: 'box-shadow 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.boxShadow = '2px 2px 0 var(--sk-ink)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit-button"
                className="sketch-btn sketch-btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '14px',
                  fontSize: '1rem',
                  marginTop: '0.5rem',
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <div style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              paddingTop: '1.5rem',
              borderTop: '1px dashed var(--sk-ink-muted)',
            }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--sk-ink-muted)', margin: '0 0 0.5rem' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--sk-accent)', fontWeight: 600, textDecoration: 'none' }}>
                  Sign up
                </Link>
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--sk-ink-muted)', margin: '0.5rem 0 0' }}>
                Demo: TPO — tpo@college.edu / tpo123 | Student — student@college.edu / student123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
