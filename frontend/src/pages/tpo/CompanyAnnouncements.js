import React, { useEffect, useState } from 'react';
import { FileUp, Plus, Trash2, Upload, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { useRoadmaps } from '../../contexts/RoadmapContext';

const ACCEPTED_JD_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const ACCEPTED_JD_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_JD_SIZE = 5 * 1024 * 1024;

function isValidJdFile(file) {
  if (!file) return false;
  const lowerName = (file.name || '').toLowerCase();
  const hasValidExt = ACCEPTED_JD_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const hasValidType = ACCEPTED_JD_TYPES.includes(file.type);
  return hasValidExt || hasValidType;
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CompanyAnnouncements() {
  const { companies, addCompanyAnnouncement, removeCompanyAnnouncement } = useRoadmaps();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isDraggingJd, setIsDraggingJd] = useState(false);
  const [jdUpload, setJdUpload] = useState(null);
  const [newCompany, setNewCompany] = useState({
    company_name: '',
    role: '',
    date: '',
    eligibility: '',
    status: 'active',
    package: ''
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const resetAddCompanyState = () => {
    setNewCompany({ company_name: '', role: '', date: '', eligibility: '', status: 'active', package: '' });
    setJdUpload(null);
    setIsDraggingJd(false);
  };

  const handleOpenChange = (open) => {
    setShowAddDialog(open);
    if (!open) resetAddCompanyState();
  };

  const processJdFile = async (file) => {
    if (!file) return;

    if (!isValidJdFile(file)) {
      toast.error('Only PDF, DOC, or DOCX files are allowed');
      return;
    }

    if (file.size > MAX_JD_SIZE) {
      toast.error('JD file must be 5 MB or smaller');
      return;
    }

    try {
      const dataUrl = await toDataUrl(file);
      setJdUpload({
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        dataUrl
      });
      toast.success('JD uploaded');
    } catch (_err) {
      toast.error('Failed to upload JD file');
    }
  };

  const handleJdFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    await processJdFile(file);
    e.target.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingJd(false);
    const file = e.dataTransfer.files?.[0];
    await processJdFile(file);
  };

  const handleAddCompany = async () => {
    if (!newCompany.company_name || !newCompany.role || !newCompany.date || !newCompany.eligibility) {
      toast.error('Please fill required fields');
      return;
    }

    // Append locally for mock mode
    addCompanyAnnouncement({
      ...newCompany,
      jdFileName: jdUpload?.fileName,
      jdFileType: jdUpload?.fileType,
      jdFileSize: jdUpload?.fileSize,
      jdDataUrl: jdUpload?.dataUrl
    });
    toast.success('Company added (mock)');
    setShowAddDialog(false);
    resetAddCompanyState();
  };

  const handleRemoveCompany = (company) => {
    if (!company?.id) return;
    const confirmed = window.confirm(`Remove ${company.company_name}?`);
    if (!confirmed) return;

    removeCompanyAnnouncement(company.id);
    if (selectedCompany?.id === company.id) {
      setSelectedCompany(null);
    }
    toast.success('Company removed');
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
        <Sheet open={showAddDialog} onOpenChange={handleOpenChange}>
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
              <div>
                <Label htmlFor="jd_upload">JD (PDF / DOC / DOCX)</Label>
                <label
                  htmlFor="jd_upload"
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDraggingJd(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDraggingJd(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDraggingJd(false);
                  }}
                  onDrop={handleDrop}
                  className={`mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors cursor-pointer ${
                    isDraggingJd ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:border-indigo-400'
                  }`}
                >
                  <Upload className="w-5 h-5 text-slate-500 mb-2" />
                  <p className="text-sm font-medium text-slate-800">Drag and drop JD here</p>
                  <p className="text-xs text-slate-500 mt-1">or click to browse (max 5 MB)</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX</p>
                </label>
                <Input
                  id="jd_upload"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleJdFileInputChange}
                  className="hidden"
                />
                {jdUpload && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{jdUpload.fileName}</p>
                      <p className="text-xs text-slate-500">{formatBytes(jdUpload.fileSize)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setJdUpload(null)}
                      className="text-slate-400 hover:text-slate-600"
                      aria-label="Remove uploaded JD"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
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
              <th className="text-right py-4 px-6 text-xs uppercase tracking-wider font-semibold text-slate-500">Actions</th>
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
                <td className="py-4 px-6 text-right">
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCompany(company);
                    }}
                    variant="outline"
                    className="h-8 px-2 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    data-testid={`remove-company-button-${idx}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleRemoveCompany(selectedCompany)}
                  className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  data-testid="remove-selected-company-button"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Company
                </Button>
              </div>

              {selectedCompany.jdDataUrl && (
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Job Description</p>
                  <a
                    href={selectedCompany.jdDataUrl}
                    download={selectedCompany.jdFileName || 'JD'}
                    className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    <FileUp className="w-4 h-4" />
                    Download {selectedCompany.jdFileName || 'JD'}
                  </a>
                </div>
              )}

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
