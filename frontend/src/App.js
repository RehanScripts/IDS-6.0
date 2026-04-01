import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import TPOLayout from './pages/tpo/TPOLayout';
import TPODashboard from './pages/tpo/TPODashboard';
import CompanyAnnouncements from './pages/tpo/CompanyAnnouncements';
import StudentInsights from './pages/tpo/StudentInsights';
import AIReports from './pages/tpo/AIReports';
import ShortlistedCandidates from './pages/tpo/ShortlistedCandidates';
import Settings from './pages/tpo/Settings';
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import Companies from './pages/student/Companies';
import MyRoadmaps from './pages/student/MyRoadmaps';
import Progress from './pages/student/Progress';
import Profile from './pages/student/Profile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route
            path="/tpo"
            element={
              <ProtectedRoute allowedRoles={['tpo']}>
                <TPOLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/tpo/dashboard" replace />} />
            <Route path="dashboard" element={<TPODashboard />} />
            <Route path="companies" element={<CompanyAnnouncements />} />
            <Route path="students" element={<StudentInsights />} />
            <Route path="ai-reports" element={<AIReports />} />
            <Route path="shortlisted" element={<ShortlistedCandidates />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="companies" element={<Companies />} />
            <Route path="roadmaps" element={<MyRoadmaps />} />
            <Route path="progress" element={<Progress />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
