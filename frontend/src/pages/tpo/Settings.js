import React from 'react';
import { Settings as SettingsIcon, User, Bell, Lock } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-6 md:p-8" data-testid="settings-page">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>Settings</h1>
        <p className="text-slate-500 mt-2">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-medium text-slate-900" style={{fontFamily: 'Outfit'}}>Profile Settings</h2>
          </div>
          <p className="text-sm text-slate-600">Update your personal information and profile details</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-medium text-slate-900" style={{fontFamily: 'Outfit'}}>Notifications</h2>
          </div>
          <p className="text-sm text-slate-600">Configure your notification preferences</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-medium text-slate-900" style={{fontFamily: 'Outfit'}}>Security</h2>
          </div>
          <p className="text-sm text-slate-600">Manage your password and security settings</p>
        </div>
      </div>
    </div>
  );
}
