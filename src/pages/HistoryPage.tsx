import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Eye, Trash2, Search } from 'lucide-react';
import { analysesAPI, type Analysis } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import DashboardLayout from '@/components/DashboardLayout';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState, PageLoader } from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { formatDate, getScoreColor, getScoreLabel } from '@/utils/textUtils';

export default function HistoryPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Analysis | null>(null);

  const loadAnalyses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await analysesAPI.getAll();
      setAnalyses(response.data?.analyses || []);
    } catch {
      showToast('Failed to load analyses', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await analysesAPI.delete(deleteTarget.id);
      setAnalyses((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      showToast('Analysis deleted', 'success');
    } catch {
      showToast('Failed to delete analysis', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = analyses.filter(
    (a) =>
      a.company_name.toLowerCase().includes(search.toLowerCase()) ||
      a.job_role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View and manage your past resume analyses
        </p>
      </div>

      {analyses.length > 0 && (
        <div className="mb-4 max-w-md">
          <Input
            placeholder="Search by company or job role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <PageLoader message="Loading analyses..." />
      ) : analyses.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<History className="w-12 h-12" />}
              title="No analyses yet"
              description="Run your first resume analysis to see results here."
              action={
                <Button onClick={() => navigate('/analyze')}>
                  New Analysis
                </Button>
              }
            />
          </CardBody>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Search className="w-12 h-12" />}
              title="No results found"
              description={`No analyses match "${search}"`}
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{filtered.length} {filtered.length === 1 ? 'Analysis' : 'Analyses'}</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Company</th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Job Role</th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Score</th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Match Level</th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Date</th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map((analysis) => (
                    <tr key={analysis.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{analysis.company_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{analysis.job_role}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${getScoreColor(Number(analysis.ats_score))}`}>
                          {Number(analysis.ats_score)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={Number(analysis.ats_score) >= 80 ? 'success' : Number(analysis.ats_score) >= 60 ? 'warning' : Number(analysis.ats_score) >= 40 ? 'warning' : 'danger'}>
                          {getScoreLabel(Number(analysis.ats_score))}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(analysis.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/analysis/${analysis.id}`)}
                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(analysis)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Analysis?"
        size="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete the analysis for{' '}
          <span className="font-semibold">{deleteTarget?.company_name} — {deleteTarget?.job_role}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
