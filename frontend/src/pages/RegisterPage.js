import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, ArrowLeft, Upload, CheckCircle, Users, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './LandingPage.css';

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '2px solid var(--sk-ink)',
  borderRadius: '10px',
  background: 'var(--sk-cream)',
  fontSize: '0.92rem',
  fontFamily: 'var(--sk-font-body)',
  outline: 'none',
  transition: 'box-shadow 0.2s ease',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontWeight: 600,
  fontSize: '0.85rem',
  marginBottom: '6px',
  color: 'var(--sk-ink)',
  fontFamily: 'var(--sk-font-display)',
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [year, setYear] = useState('Final Year');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('Computer Science');
  const [about, setAbout] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const totalSteps = role === 'student' ? 4 : 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(email, password, name, role, branch, {
      collegeName,
      year,
      about,
      resumeFile,
    });
    setLoading(false);

    if (result.success) {
      navigate(role === 'tpo' ? '/tpo/dashboard' : '/student/dashboard');
      return;
    }

    setError(result.error || 'Registration failed');
  };

  const nextStep = () => {
    if (step === 1 && !role) {
      setError('Please select your role');
      return;
    }
    if (step === 2 && (!name || !email || !password)) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleFocus = (e) => { e.target.style.boxShadow = '2px 2px 0 var(--sk-ink)'; };
  const handleBlur = (e) => { e.target.style.boxShadow = 'none'; };

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
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: 'var(--sk-ink)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500,
        }}>
          <ArrowLeft size={16} /> Back to home
        </Link>
      </header>

      {/* Register Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--sk-cream)' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontFamily: 'var(--sk-font-display)', fontSize: '2.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--sk-ink)' }}>
              Create your profile
            </h1>
            <p style={{ color: 'var(--sk-ink-muted)', fontSize: '0.95rem', margin: 0 }}>
              Let's build your placement readiness journey
            </p>
          </div>

          {/* Step Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}>
            {Array.from({ length: totalSteps || 3 }, (_, i) => i + 1).map((s) => (
              <React.Fragment key={s}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '2px solid var(--sk-ink)',
                  background: step >= s ? 'var(--sk-accent)' : 'var(--sk-cream-light)',
                  color: step >= s ? '#fff' : 'var(--sk-ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--sk-font-display)',
                  boxShadow: step === s ? '2px 2px 0 var(--sk-ink)' : 'none',
                  transition: 'all 0.3s ease',
                }}>
                  {step > s ? <CheckCircle size={18} /> : s}
                </div>
                {s < (totalSteps || 3) && (
                  <div style={{
                    width: 40, height: 2,
                    background: step > s ? 'var(--sk-accent)' : 'var(--sk-ink-muted)',
                    borderRadius: 2, transition: 'background 0.3s ease',
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div style={{
            background: 'var(--sk-cream-light)', border: '2px solid var(--sk-ink)',
            borderRadius: 'var(--sk-border-radius)', boxShadow: '5px 5px 0 var(--sk-ink)', padding: '2rem',
          }}>
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem', border: '1.5px solid #FECACA', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              {/* Step 1: Role Selection */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontFamily: 'var(--sk-font-display)', fontWeight: 600, fontSize: '1.1rem', margin: '0 0 0.5rem', color: 'var(--sk-ink)' }}>
                    I am a...
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button type="button" onClick={() => setRole('student')} style={{
                      padding: '2rem 1.5rem', border: `2px solid ${role === 'student' ? 'var(--sk-accent)' : 'var(--sk-ink)'}`,
                      borderRadius: 'var(--sk-border-radius)', cursor: 'pointer', textAlign: 'center',
                      background: role === 'student' ? 'var(--sk-mint)' : 'var(--sk-cream)',
                      boxShadow: role === 'student' ? '2px 2px 0 var(--sk-accent)' : '3px 3px 0 var(--sk-ink)',
                      transition: 'all 0.25s ease', fontFamily: 'var(--sk-font-body)',
                    }}>
                      <Users size={32} style={{ margin: '0 auto 12px', display: 'block', color: role === 'student' ? 'var(--sk-accent)' : 'var(--sk-ink)' }} />
                      <p style={{ fontFamily: 'var(--sk-font-display)', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 4px' }}>Student</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--sk-ink-muted)', margin: 0 }}>Preparing for placements</p>
                    </button>

                    <button type="button" onClick={() => setRole('tpo')} style={{
                      padding: '2rem 1.5rem', border: `2px solid ${role === 'tpo' ? 'var(--sk-accent)' : 'var(--sk-ink)'}`,
                      borderRadius: 'var(--sk-border-radius)', cursor: 'pointer', textAlign: 'center',
                      background: role === 'tpo' ? 'var(--sk-mint)' : 'var(--sk-cream)',
                      boxShadow: role === 'tpo' ? '2px 2px 0 var(--sk-accent)' : '3px 3px 0 var(--sk-ink)',
                      transition: 'all 0.25s ease', fontFamily: 'var(--sk-font-body)',
                    }}>
                      <ShieldCheck size={32} style={{ margin: '0 auto 12px', display: 'block', color: role === 'tpo' ? 'var(--sk-accent)' : 'var(--sk-ink)' }} />
                      <p style={{ fontFamily: 'var(--sk-font-display)', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 4px' }}>TPO</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--sk-ink-muted)', margin: 0 }}>Placement coordinator</p>
                    </button>
                  </div>

                  <button type="button" className="sketch-btn sketch-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '0.5rem' }}
                    onClick={nextStep}>
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Step 2: Basic Info */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontFamily: 'var(--sk-font-display)', fontWeight: 600, fontSize: '1.1rem', margin: '0 0 0.5rem', color: 'var(--sk-ink)' }}>
                    Basic Information
                  </p>
                  <div>
                    <label htmlFor="name" style={labelStyle}>Full Name *</label>
                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter your full name" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                  </div>
                  <div>
                    <label htmlFor="email" style={labelStyle}>Email Address *</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@college.edu" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                  </div>
                  <div>
                    <label htmlFor="password" style={labelStyle}>Password *</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Create a strong password" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                    <button type="button" className="sketch-btn sketch-btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '13px' }} onClick={prevStep}>
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button type="button" className="sketch-btn sketch-btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '13px' }} onClick={nextStep}>
                      Continue <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Academic Details (Student) or Submit (TPO) */}
              {step === 3 && role === 'student' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontFamily: 'var(--sk-font-display)', fontWeight: 600, fontSize: '1.1rem', margin: '0 0 0.5rem', color: 'var(--sk-ink)' }}>
                    Academic Details
                  </p>
                  <div>
                    <label htmlFor="collegeName" style={labelStyle}>College Name</label>
                    <input id="collegeName" type="text" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} required placeholder="e.g., K.K. Wagh Institute" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label htmlFor="branch" style={labelStyle}>Branch</label>
                      <select id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }} onFocus={handleFocus} onBlur={handleBlur}>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Civil">Civil</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="year" style={labelStyle}>Year</label>
                      <select id="year" value={year} onChange={(e) => setYear(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }} onFocus={handleFocus} onBlur={handleBlur}>
                        <option value="First Year">First Year</option>
                        <option value="Second Year">Second Year</option>
                        <option value="Third Year">Third Year</option>
                        <option value="Final Year">Final Year</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="careerGoal" style={labelStyle}>Career Goal</label>
                    <input id="careerGoal" type="text" value={careerGoal} onChange={(e) => setCareerGoal(e.target.value)} placeholder="e.g., Full Stack Developer" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                    <button type="button" className="sketch-btn sketch-btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '13px' }} onClick={prevStep}>
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button type="button" className="sketch-btn sketch-btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '13px' }} onClick={nextStep}>
                      Continue <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 for TPO: About & Submit */}
              {step === 3 && role === 'tpo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontFamily: 'var(--sk-font-display)', fontWeight: 600, fontSize: '1.1rem', margin: '0 0 0.5rem', color: 'var(--sk-ink)' }}>
                    TPO Details
                  </p>
                  <div>
                    <label htmlFor="collegeName" style={labelStyle}>College / Institution</label>
                    <input id="collegeName" type="text" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} required placeholder="e.g., K.K. Wagh Institute" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                  </div>
                  <div>
                    <label htmlFor="about" style={labelStyle}>About / Department</label>
                    <textarea id="about" value={about} onChange={(e) => setAbout(e.target.value)} required rows={3} placeholder="Describe your role and department" style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} onFocus={handleFocus} onBlur={handleBlur} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                    <button type="button" className="sketch-btn sketch-btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '13px' }} onClick={prevStep}>
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button type="submit" disabled={loading} className="sketch-btn sketch-btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '13px' }}>
                      {loading ? 'Creating...' : 'Create Account'} {!loading && <ArrowRight size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Student About & Resume */}
              {step === 4 && role === 'student' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontFamily: 'var(--sk-font-display)', fontWeight: 600, fontSize: '1.1rem', margin: '0 0 0.5rem', color: 'var(--sk-ink)' }}>
                    Profile & Resume
                  </p>
                  <div>
                    <label htmlFor="about" style={labelStyle}>About Yourself</label>
                    <textarea id="about" value={about} onChange={(e) => setAbout(e.target.value)} required rows={3} placeholder="Tell us about your skills, interests..." style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} onFocus={handleFocus} onBlur={handleBlur} />
                  </div>
                  <div>
                    <label style={labelStyle}>Upload Resume</label>
                    <div style={{ border: '2px dashed var(--sk-ink)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', background: 'var(--sk-cream)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => document.getElementById('resume-input').click()}
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = 'var(--sk-mint)'; }}
                      onDragLeave={(e) => { e.currentTarget.style.background = 'var(--sk-cream)'; }}
                      onDrop={(e) => { e.preventDefault(); e.currentTarget.style.background = 'var(--sk-cream)'; setResumeFile(e.dataTransfer.files?.[0] || null); }}>
                      <input id="resume-input" type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                      {resumeFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <CheckCircle size={20} color="var(--sk-accent)" />
                          <span style={{ fontWeight: 600, color: 'var(--sk-accent)', fontSize: '0.92rem' }}>{resumeFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={28} color="var(--sk-ink-muted)" style={{ marginBottom: '8px' }} />
                          <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.92rem', color: 'var(--sk-ink)' }}>Click or drag to upload</p>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--sk-ink-muted)' }}>PDF, DOC, DOCX, or image</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                    <button type="button" className="sketch-btn sketch-btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '13px' }} onClick={prevStep}>
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button type="submit" disabled={loading} className="sketch-btn sketch-btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '13px' }}>
                      {loading ? 'Creating...' : 'Create Account'} {!loading && <ArrowRight size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px dashed var(--sk-ink-muted)' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--sk-ink-muted)', margin: 0 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--sk-accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
