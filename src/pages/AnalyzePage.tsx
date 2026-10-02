import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Play,
} from 'lucide-react';
import { resumesAPI, analysesAPI, type Resume } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import DashboardLayout from '@/components/DashboardLayout';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/Loading';

export default function AnalyzePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [loadingResumes, setLoadingResumes] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [companyName, setCompanyName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [location, setLocation] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [errors, setErrors] = useState<{ companyName?: string; jobRole?: string; jobDescription?: string }>({});

  const loadResumes = useCallback(async () => {
    setLoadingResumes(true);
    try {
      const response = await resumesAPI.getAll();
      setResumes(response.data.resumes || []);
    } catch (err: any) {
      showToast('Failed to load resumes', 'error');
    } finally {
      setLoadingResumes(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Please upload a PDF file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5 MB limit', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      setUploadProgress(50);
      const response = await resumesAPI.upload(file);
      setUploadProgress(100);

      const newResume = response.data.resume;
      setResumes((prev) => [newResume, ...prev]);
      setSelectedResume(newResume);
      showToast('Resume uploaded and parsed successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to upload resume', 'error');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const handleDeleteResume = async (resume: Resume) => {
    try {
      await resumesAPI.delete(resume.id);
      setResumes((prev) => prev.filter((r) => r.id !== resume.id));
      if (selectedResume?.id === resume.id) setSelectedResume(null);
      showToast('Resume deleted', 'success');
    } catch {
      showToast('Failed to delete resume', 'error');
    }
  };

  const handleAnalyze = async () => {
    const e: typeof errors = {};
    if (!companyName.trim()) e.companyName = 'Company name is required';
    if (!jobRole.trim()) e.jobRole = 'Job role is required';
    if (!jobDescription.trim()) e.jobDescription = 'Job description is required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    if (!selectedResume) {
      showToast('Please select a resume first', 'warning');
      return;
    }

    setAnalyzing(true);

    try {
      const response = await analysesAPI.create({
        resume_id: selectedResume.id,
        company_name: companyName.trim(),
        job_role: jobRole.trim(),
        job_location: location.trim() || undefined,
        job_description: jobDescription.trim(),
      });

      showToast('Analysis complete!', 'success');
      navigate(`/analysis/${response.data.analysis.id}`);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Analysis failed', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Analysis</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Upload a resume and paste a job description to get your ATS-style match score
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume upload / selection */}
        <Card>
          <CardHeader>
            <CardTitle>1. Select Resume</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Upload zone */}
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Processing PDF...</p>
                    {uploadProgress > 0 && (
                      <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Click to upload a PDF resume
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF only, max 5 MB</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  e.target.value = '';
                }}
                disabled={uploading}
              />
            </label>

            {/* Resume list */}
            <div className="space-y-2">
              {loadingResumes ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : resumes.length === 0 ? (
                <EmptyState
                  icon={<FileText className="w-8 h-8" />}
                  title="No resumes yet"
                  description="Upload a PDF above to get started."
                />
              ) : (
                resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedResume?.id === resume.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedResume(resume)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {resume.file_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {resume.text_length ? `${resume.text_length} chars extracted` : 'No text'}
                      </p>
                    </div>
                    {selectedResume?.id === resume.id && (
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteResume(resume);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        {/* Job description */}
        <Card>
          <CardHeader>
            <CardTitle>2. Job Description</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Company Name"
                  placeholder="e.g., Google"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  error={errors.companyName}
                />
              </div>
              <div>
                <Input
                  label="Job Role"
                  placeholder="e.g., Software Engineer"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  error={errors.jobRole}
                />
              </div>
            </div>
            <Input
              label="Location (optional)"
              placeholder="e.g., Bangalore, India"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Textarea
              label="Job Description"
              placeholder="Paste the full job description here..."
              rows={10}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              error={errors.jobDescription}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {jobDescription.length} characters
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Analyze button */}
      <div className="flex justify-center mt-6">
        <Button
          size="lg"
          onClick={handleAnalyze}
          loading={analyzing}
          disabled={!selectedResume || !companyName || !jobRole || !jobDescription}
        >
          {!analyzing && <Play className="w-5 h-5" />}
          {analyzing ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 max-w-2xl mx-auto">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            This score is an estimate generated using our matching algorithm and does not represent
            the scoring algorithm used by any specific employer's ATS.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
