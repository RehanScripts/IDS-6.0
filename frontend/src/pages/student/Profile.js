import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, GraduationCap, Award } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="p-6 md:p-8" data-testid="profile-page">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>Profile</h1>
        <p className="text-slate-500 mt-2">Manage your personal information</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-200">
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
            {user?.name?.[0] || 'S'}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900" style={{fontFamily: 'Outfit'}}>{user?.name}</h2>
            <p className="text-slate-500 mt-1">Student</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Email</p>
              <p className="text-sm font-medium text-slate-900 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Branch</p>
              <p className="text-sm font-medium text-slate-900 mt-0.5">{user?.branch || 'Not specified'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Role</p>
              <p className="text-sm font-medium text-slate-900 mt-0.5 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
