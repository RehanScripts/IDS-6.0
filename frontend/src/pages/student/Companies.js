import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/student/companies`, { withCredentials: true });
      setCompanies(data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async (company) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/student/roadmaps`,
        {
          company_id: company.id,
          company_name: company.company_name,
          role: company.role
        },
        { withCredentials: true }
      );
      toast.success(`Roadmap generated for ${company.company_name}!`);
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
      toast.error('Failed to generate roadmap');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8" data-testid="companies-page">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>Companies</h1>
        <p className="text-slate-500 mt-2">Browse upcoming companies and generate personalized roadmaps</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company, idx) => (
          <div
            key={idx}
            data-testid={`company-card-${idx}`}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <span className="text-lg font-semibold text-indigo-600">{company.company_name[0]}</span>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {company.status}
              </span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">{company.company_name}</h3>
            <p className="text-sm text-slate-600 mb-2">{company.role}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <MapPin className="w-3 h-3" />
              <span>{company.date}</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">{company.eligibility}</p>
            {company.package && (
              <p className="text-sm font-medium text-indigo-600 mb-4">{company.package}</p>
            )}
            <button
              onClick={() => handleGenerateRoadmap(company)}
              data-testid={`generate-roadmap-button-${idx}`}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Generate Roadmap
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
