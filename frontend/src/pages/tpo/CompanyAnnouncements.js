import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

export default function CompanyAnnouncements() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCompany, setNewCompany] = useState({
    company_name: '',
    role: '',
    date: '',
    eligibility: '',
    status: 'active',
    package: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tpo/companies`, { withCredentials: true });
      setCompanies(data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/tpo/companies`, newCompany, { withCredentials: true });
      toast.success('Company added successfully');
      setShowAddDialog(false);
      setNewCompany({ company_name: '', role: '', date: '', eligibility: '', status: 'active', package: '' });
      fetchCompanies();
    } catch (error) {
      console.error('Failed to add company:', error);
      toast.error('Failed to add company');
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
    <div className="p-6 md:p-8" data-testid="company-announcements-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>Company Announcements</h1>
          <p className="text-slate-500 mt-2">Manage company visits and announcements</p>
        </div>
        <Sheet open={showAddDialog} onOpenChange={setShowAddDialog}>
          <SheetTrigger asChild>
            <Button data-testid="add-company-button" className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] p-6">
            <SheetHeader>
              <SheetTitle className="text-2xl font-semibold" style={{fontFamily: 'Outfit'}}>Add New Company</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={newCompany.company_name}
                  onChange={(e) => setNewCompany({ ...newCompany, company_name: e.target.value })}
                  data-testid="add-company-name-input"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={newCompany.role}
                  onChange={(e) => setNewCompany({ ...newCompany, role: e.target.value })}
                  data-testid="add-company-role-input"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newCompany.date}
                  onChange={(e) => setNewCompany({ ...newCompany, date: e.target.value })}
                  data-testid="add-company-date-input"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="eligibility">Eligibility</Label>
                <Input
                  id="eligibility"
                  value={newCompany.eligibility}
                  onChange={(e) => setNewCompany({ ...newCompany, eligibility: e.target.value })}
                  data-testid="add-company-eligibility-input"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="package">Package</Label>
                <Input
                  id="package"
                  value={newCompany.package}
                  onChange={(e) => setNewCompany({ ...newCompany, package: e.target.value })}
                  data-testid="add-company-package-input"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleAddCompany}
                data-testid="add-company-submit-button"
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Add Company
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-4 px-6 text-xs uppercase tracking-wider font-semibold text-slate-500">Company Name</th>
              <th className="text-left py-4 px-6 text-xs uppercase tracking-wider font-semibold text-slate-500">Role</th>
              <th className="text-left py-4 px-6 text-xs uppercase tracking-wider font-semibold text-slate-500">Date</th>
              <th className="text-left py-4 px-6 text-xs uppercase tracking-wider font-semibold text-slate-500">Eligibility</th>
              <th className="text-left py-4 px-6 text-xs uppercase tracking-wider font-semibold text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, idx) => (
              <tr
                key={idx}
                onClick={() => setSelectedCompany(company)}
                data-testid={`company-row-${idx}`}
                className="border-t border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="py-4 px-6 text-sm font-medium text-slate-900">{company.company_name}</td>
                <td className="py-4 px-6 text-sm text-slate-600">{company.role}</td>
                <td className="py-4 px-6 text-sm text-slate-600">{company.date}</td>
                <td className="py-4 px-6 text-sm text-slate-600">{company.eligibility}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {company.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCompany && (
        <Sheet open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
          <SheetContent className="w-[400px] sm:w-[540px] p-0" data-testid="company-details-drawer">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900" style={{fontFamily: 'Outfit'}}>{selectedCompany.company_name}</h2>
                  <p className="text-slate-500 mt-1">{selectedCompany.role}</p>
                </div>
                <button onClick={() => setSelectedCompany(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Details</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Date</span>
                    <span className="text-sm font-medium text-slate-900">{selectedCompany.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Eligibility</span>
                    <span className="text-sm font-medium text-slate-900">{selectedCompany.eligibility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Package</span>
                    <span className="text-sm font-medium text-slate-900">{selectedCompany.package || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Status</span>
                    <span className={`text-sm font-medium ${
                      selectedCompany.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                    }`}>{selectedCompany.status}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Students Applied</p>
                <p className="text-sm text-slate-600">15 students have applied for this position</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Avg Readiness Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-slate-900">72%</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
