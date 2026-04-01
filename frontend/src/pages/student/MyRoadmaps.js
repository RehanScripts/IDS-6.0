import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, Calendar, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function MyRoadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/student/roadmaps`, { withCredentials: true });
      setRoadmaps(data);
      if (data.length > 0) {
        setSelectedRoadmap(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch roadmaps:', error);
      toast.error('Failed to load roadmaps');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <div className="p-6 md:p-8" data-testid="roadmaps-page">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>My Roadmaps</h1>
          <p className="text-slate-500 mt-2">Your personalized preparation roadmaps</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-8 text-center">
          <BookOpen className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-900 mb-2" style={{fontFamily: 'Outfit'}}>No Roadmaps Yet</h2>
          <p className="text-slate-600">Generate your first roadmap from the Companies page to start preparing!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8" data-testid="roadmaps-page">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>My Roadmaps</h1>
        <p className="text-slate-500 mt-2">Your personalized preparation roadmaps</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-medium text-slate-900 mb-4" style={{fontFamily: 'Outfit'}}>Select Company</h2>
            <div className="space-y-2">
              {roadmaps.map((roadmap, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedRoadmap(roadmap)}
                  data-testid={`roadmap-selector-${idx}`}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedRoadmap?.id === roadmap.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-medium text-slate-900">{roadmap.company_name}</p>
                  <p className="text-sm text-slate-600">{roadmap.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {selectedRoadmap && (
            <>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="skill-gap-section">
                <h2 className="text-xl font-medium text-slate-900 mb-4" style={{fontFamily: 'Outfit'}}>Skill Gap</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedRoadmap.skill_gaps?.map((skill, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 border border-red-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="14-day-plan-section">
                <h2 className="text-xl font-medium text-slate-900 mb-4" style={{fontFamily: 'Outfit'}}>14-Day Preparation Plan</h2>
                <div className="space-y-3">
                  {selectedRoadmap.plan?.map((item, idx) => (
                    <div
                      key={idx}
                      data-testid={`day-plan-${idx}`}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-semibold text-sm">
                        {item.day}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{item.task}</p>
                      </div>
                      <Calendar className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="resources-section">
                <h2 className="text-xl font-medium text-slate-900 mb-4" style={{fontFamily: 'Outfit'}}>Resources</h2>
                <div className="space-y-3">
                  {selectedRoadmap.resources?.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`resource-link-${idx}`}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all"
                    >
                      <span className="text-sm font-medium text-slate-900">{resource.title}</span>
                      <ExternalLink className="w-4 h-4 text-indigo-600" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="interview-prep-section">
                <h2 className="text-xl font-medium text-slate-900 mb-4" style={{fontFamily: 'Outfit'}}>Interview Prep</h2>
                <div className="space-y-3">
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-sm font-medium text-slate-900 mb-2">Technical Round</p>
                    <p className="text-sm text-slate-600">Focus on DSA, system design, and technology-specific questions</p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-sm font-medium text-slate-900 mb-2">Behavioral Round</p>
                    <p className="text-sm text-slate-600">Prepare STAR format answers for leadership, teamwork, and problem-solving</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
