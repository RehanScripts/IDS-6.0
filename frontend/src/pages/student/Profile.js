import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, GraduationCap, Calendar, FileText, School, Sparkles, Link2, Phone } from 'lucide-react';

function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 break-words">{value || 'Not provided'}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, updateProfileAbout, updateProfileResume, apiBaseUrl } = useAuth();
  const [aboutDraft, setAboutDraft] = useState('');
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [aboutStatus, setAboutStatus] = useState('');
  const [resumeStatus, setResumeStatus] = useState('');
  const [resumeUploadStatus, setResumeUploadStatus] = useState('');
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const insights = user?.resume_insights || {};

  useEffect(() => {
    setAboutDraft(user?.about || '');
  }, [user?.about]);

  const handleAboutSave = async () => {
    const trimmed = aboutDraft.trim();
    if (!trimmed) {
      setAboutStatus('About section cannot be empty.');
      return;
    }

    setIsSavingAbout(true);
    setAboutStatus('');
    const result = await updateProfileAbout(trimmed);
    setIsSavingAbout(false);

    if (!result.success) {
      setAboutStatus(result.error || 'Failed to update profile.');
      return;
    }

    setIsEditingAbout(false);
    setAboutStatus('About updated successfully.');
  };

  const handleViewResume = async () => {
    setResumeStatus('');
    try {
      const response = await fetch(`${apiBaseUrl}/api/student/resume`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        setResumeStatus(errorPayload.detail || 'Resume is not available for this account.');
        return;
      }

      const blob = await response.blob();
      const resumeUrl = URL.createObjectURL(blob);
      window.open(resumeUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(resumeUrl), 60000);
    } catch {
      setResumeStatus('Could not open resume right now.');
    }
  };

  const handleResumeReupload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setResumeUploadStatus('');
    setIsUploadingResume(true);
    const result = await updateProfileResume(file);
    setIsUploadingResume(false);

    if (!result.success) {
      setResumeUploadStatus(result.error || 'Failed to upload resume.');
      event.target.value = '';
      return;
    }

    setResumeUploadStatus('Resume updated successfully.');
    event.target.value = '';
  };

  if (!user) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>Profile</h2>
          <p className="text-slate-500 mt-2">Sign in to view your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto" data-testid="profile-page">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit' }}>Profile</h1>
        <p className="text-slate-500 mt-2">All information shared during signup appears here.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6 pb-6 border-b border-slate-200">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold flex-shrink-0">
            {(user.name || 'S')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>{user.name || 'Student'}</h2>
            <p className="text-blue-600 font-medium mt-1">{user.role === 'student' ? 'Student Profile' : 'TPO Profile'}</p>
            <p className="text-slate-500 text-sm mt-1">{user.college_name || 'College name not provided'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-8">
          <Field icon={User} label="User Name" value={user.name} />
          <Field icon={Mail} label="Email" value={user.email} />
          <Field icon={School} label="College Name" value={user.college_name} />
          <Field icon={GraduationCap} label="Branch" value={user.branch} />
          <Field icon={Calendar} label="Year" value={user.year} />
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Resume File</p>
              <p className="text-sm font-medium text-slate-900 break-words">{user.resume_file_name || 'Not provided'}</p>
              <button
                type="button"
                onClick={handleViewResume}
                className="mt-2 inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                View Resume
              </button>
              <label className="mt-2 ml-2 inline-flex items-center px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-50 transition-colors cursor-pointer">
                {isUploadingResume ? 'Uploading...' : 'Re-upload Resume'}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={handleResumeReupload}
                  className="hidden"
                  disabled={isUploadingResume}
                />
              </label>
              {resumeStatus ? <p className="mt-2 text-xs text-slate-500">{resumeStatus}</p> : null}
              {resumeUploadStatus ? <p className="mt-2 text-xs text-slate-500">{resumeUploadStatus}</p> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>About</h3>
          {!isEditingAbout ? (
            <button
              type="button"
              onClick={() => {
                setIsEditingAbout(true);
                setAboutStatus('');
              }}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-50 transition-colors"
            >
              Edit
            </button>
          ) : null}
        </div>

        {!isEditingAbout ? (
          <p className="text-sm text-slate-600 leading-relaxed">{user.about || 'No about section added yet.'}</p>
        ) : (
          <div className="space-y-3">
            <textarea
              value={aboutDraft}
              onChange={(event) => setAboutDraft(event.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              placeholder="Tell us about yourself"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAboutSave}
                disabled={isSavingAbout}
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-70 transition-colors"
              >
                {isSavingAbout ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingAbout(false);
                  setAboutDraft(user.about || '');
                  setAboutStatus('');
                }}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {aboutStatus ? <p className="mt-3 text-xs text-slate-500">{aboutStatus}</p> : null}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
          <Sparkles className="w-5 h-5 text-blue-600" /> Resume Insights (OCR + NLP)
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Detected Skills</h4>
            <div className="flex flex-wrap gap-2">
              {(insights.skills || []).length > 0 ? (insights.skills || []).map((skill) => (
                <span key={skill} className="px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100">{skill}</span>
              )) : <span className="text-sm text-slate-500">No skills detected from resume.</span>}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Top Resume Terms</h4>
            <div className="flex flex-wrap gap-2">
              {(insights.top_terms || []).length > 0 ? (insights.top_terms || []).map((term) => (
                <span key={term} className="px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-700">{term}</span>
              )) : <span className="text-sm text-slate-500">No key terms found.</span>}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-5">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1"><Phone className="w-4 h-4" />Detected Phones</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              {(insights.phones || []).length > 0 ? (insights.phones || []).map((phone) => <li key={phone}>{phone}</li>) : <li>No phone numbers detected.</li>}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1"><Link2 className="w-4 h-4" />Detected Links</h4>
            <ul className="space-y-1 text-sm text-slate-600 break-all">
              {(insights.links || []).length > 0 ? (insights.links || []).map((link) => <li key={link}>{link}</li>) : <li>No links detected.</li>}
            </ul>
          </div>
        </div>

        <div className="mt-5">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Resume Summary Snippet</h4>
          <p className="text-sm text-slate-600 leading-relaxed">{insights.summary || 'No summary available yet.'}</p>
        </div>
      </div>
    </div>
  );
}
