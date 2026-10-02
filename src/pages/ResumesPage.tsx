import { useEffect, useState, useCallback } from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';
import { resumesAPI, type Resume } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import DashboardLayout from '@/components/DashboardLayout';
import Card, { CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { EmptyState, PageLoader } from '@/components/ui/Loading';
import { formatDate, truncateText } from '@/utils/textUtils';
import Modal from '@/components/ui/Modal';

export default function ResumesPage() {
  const { showToast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);

  const loadResumes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await resumesAPI.getAll();
      setResumes(response.data.resumes || []);
    } catch {
      showToast('Failed to load resumes', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const handleUpload = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Please upload a PDF file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5 MB limit', 'error');
      return;
    }

    setUploading(true);
    try {
      const response = await resumesAPI.upload(file);
      setResumes((prev) => [response.data.resume, ...prev]);
      showToast('Resume uploaded successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await resumesAPI.delete(deleteTarget.id);
      setResumes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      showToast('Resume deleted', 'success');
    } catch {
      showToast('Failed to delete resume', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Resumes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your uploaded resumes
          </p>
        </div>
        <label>
          <Button disabled={uploading} loading={uploading}>
            {!uploading && <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </Button>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = '';
            }}
            disabled={uploading}
          />
        </label>
      </div>

      {loading ? (
        <PageLoader message="Loading resumes..." />
      ) : resumes.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FileText className="w-12 h-12" />}
              title="No resumes uploaded"
              description="Upload a PDF resume to start analyzing it against job descriptions."
              action={
                <label>
                  <Button>
                    <Upload className="w-4 h-4" />
                    Upload Resume
                  </Button>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <Card key={resume.id} hover>
              <CardBody>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {resume.file_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatDate(resume.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(resume)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {resume.text_length ? (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {resume.text_length} characters extracted
                    </p>
                    <button
                      onClick={() => setPreviewResume(resume)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Preview text
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-red-500">No text extracted</p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Resume?"
        size="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <span className="font-semibold">{deleteTarget?.file_name}</span>?
          This will also delete any analyses linked to this resume. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>

      {/* Preview modal */}
      <Modal
        open={!!previewResume}
        onClose={() => setPreviewResume(null)}
        title="Extracted Text Preview"
        size="xl"
      >
        <div className="max-h-[60vh] overflow-y-auto">
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
            {previewResume?.extracted_text
              ? truncateText(previewResume.extracted_text, 2000)
              : 'No text available'}
          </pre>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
