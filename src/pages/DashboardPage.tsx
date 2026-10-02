import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  FileSearch,
  Target,
  TrendingUp,
  FileText,
  ArrowRight,
  Eye,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { analysesAPI, type Analysis } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageLoader, EmptyState } from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import { formatDate, getScoreColor } from '@/utils/textUtils';

interface DashboardStats {
  totalAnalyses: number;
  averageScore: number;
  highestScore: number;
  resumesCount: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const analysesResponse = await analysesAPI.getAll();
      const analyses = analysesResponse.data.analyses || [];
      
      const totalAnalyses = analyses.length;
      const scores = analyses.map((a) => a.ats_score);
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
      const highestScore = scores.length > 0 ? Math.max(...scores) : 0;

      // Get unique resume count from analyses
      const uniqueResumeIds = new Set(analyses.map((a) => a.resume_id));
      const resumesCount = uniqueResumeIds.size;

      setStats({
        totalAnalyses,
        averageScore,
        highestScore,
        resumesCount,
      });
      setRecentAnalyses(analyses.slice(0, 5));
    } catch (err: unknown) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Analyses',
      value: stats?.totalAnalyses ?? 0,
      icon: BarChart3,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Average Match Score',
      value: stats ? `${stats.averageScore}%` : '0%',
      icon: Target,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    },
    {
      label: 'Highest Match Score',
      value: stats ? `${stats.highestScore}%` : '0%',
      icon: TrendingUp,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Resumes Analyzed',
      value: stats?.resumesCount ?? 0,
      icon: FileText,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    },
  ];

  const chartData = recentAnalyses
    .slice()
    .reverse()
    .map((a) => ({
      name: a.job_role.length > 12 ? a.job_role.substring(0, 12) + '...' : a.job_role,
      score: a.ats_score,
    }));

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Overview of your resume analyses and match scores
          </p>
        </div>
        <Button onClick={() => navigate('/analyze')}>
          <Plus className="w-4 h-4" />
          New Analysis
        </Button>
      </div>

      {loading ? (
        <PageLoader message="Loading your dashboard..." />
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.label} hover>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent analyses */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Analyses</CardTitle>
                    {recentAnalyses.length > 0 && (
                      <button
                        onClick={() => navigate('/history')}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        View all <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  {recentAnalyses.length === 0 ? (
                    <EmptyState
                      icon={<FileSearch className="w-12 h-12" />}
                      title="No analyses yet"
                      description="Run your first resume analysis to see results here."
                      action={
                        <Button onClick={() => navigate('/analyze')} size="sm">
                          <Plus className="w-4 h-4" />
                          New Analysis
                        </Button>
                      }
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Company</th>
                            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Job Role</th>
                            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">ATS Score</th>
                            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Date</th>
                            <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {recentAnalyses.map((analysis) => (
                            <tr key={analysis.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{analysis.company_name}</td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{analysis.job_role}</td>
                              <td className="px-6 py-4">
                                <span className={`text-sm font-bold ${getScoreColor(analysis.ats_score)}`}>
                                  {analysis.ats_score}%
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(analysis.created_at)}</td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => navigate(`/analysis/${analysis.id}`)}
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Score chart */}
            <Card>
              <CardHeader>
                <CardTitle>Score Trend</CardTitle>
              </CardHeader>
              <CardBody>
                {chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-sm text-gray-400">
                    No data to display yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgb(31 41 55)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
