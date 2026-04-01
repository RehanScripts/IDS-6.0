import React from 'react';
import { Brain, TrendingUp, AlertCircle } from 'lucide-react';

export default function AIReports() {
  return (
    <div className="p-6 md:p-8" data-testid="ai-reports-page">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>AI Reports</h1>
        <p className="text-slate-500 mt-2">AI-powered insights and recommendations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
            <Brain className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Skill Gap Analysis</h3>
          <p className="text-sm text-slate-600">AI-generated insights on critical skill gaps across student cohorts</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Placement Predictions</h3>
          <p className="text-sm text-slate-600">Predictive analytics for student placement success rates</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Risk Alerts</h3>
          <p className="text-sm text-slate-600">Early warning system for at-risk students</p>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-8 text-center">
        <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-slate-900 mb-2" style={{fontFamily: 'Outfit'}}>AI Reports Coming Soon</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Advanced AI-powered analytics and insights will be available in the next release. 
          Get personalized recommendations for improving student readiness and placement outcomes.
        </p>
      </div>
    </div>
  );
}
