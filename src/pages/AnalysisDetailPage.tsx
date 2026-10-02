import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Lightbulb,
  FileText,
  GraduationCap,
  Briefcase,
  Target,
  Trash2,
  Building2,
  MapPin,
} from 'lucide-react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { analysesAPI, type Analysis } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import DashboardLayout from '@/components/DashboardLayout';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { PageLoader, ErrorState, EmptyState } from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import { formatDate, getScoreColor, getScoreLabel } from '@/utils/textUtils';

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const loadAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const response = await analysesAPI.getById(Number(id));
      const result = response.data?.analysis;
      if (!result) {
        setError('Analysis not found');
        return;
      }
      setAnalysis(result);
    } catch (err) {
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      setError(message || 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const handleDelete = async () => {
    if (!analysis) return;
    try {
      await analysesAPI.delete(analysis.id);
      showToast('Analysis deleted', 'success');
      navigate('/history');
    } catch {
      showToast('Failed to delete analysis', 'error');
    }
  };

  if (loading) return <DashboardLayout><PageLoader message="Loading analysis..." /></DashboardLayout>;
  if (error) return (
    <DashboardLayout>
      <ErrorState message={error} onRetry={() => navigate('/history')} />
    </DashboardLayout>
  );
  if (!analysis) return (
    <DashboardLayout>
      <EmptyState title="Analysis not found" description="This analysis may have been deleted." />
    </DashboardLayout>
  );

  const score = Number(analysis.ats_score);
  const scoreData = [{ name: 'Score', value: score, fill: score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444' }];

  const breakdownData = [
    { name: 'Skills', value: Number(analysis.skills_score), max: 50, fill: '#3b82f6' },
    { name: 'Keywords', value: Number(analysis.keyword_score), max: 20, fill: '#8b5cf6' },
    { name: 'Experience', value: Number(analysis.experience_score), max: 15, fill: '#06b6d4' },
    { name: 'Education', value: Number(analysis.education_score), max: 10, fill: '#10b981' },
    { name: 'Completeness', value: Number(analysis.completeness_score), max: 5, fill: '#f59e0b' },
  ];

  const matchedSkills = analysis.matched_skills || [];
  const missingSkills = analysis.missing_skills || [];
  const matchedKeywords = analysis.matched_keywords || [];
  const missingKeywords = analysis.missing_keywords || [];
  const experienceAnalysis = analysis.experience_analysis || {};
  const educationAnalysis = analysis.education_analysis || {};
  const completenessDetails = analysis.completeness_analysis || {};
  const resumeDegrees = Array.isArray(educationAnalysis.resume_degrees) ? educationAnalysis.resume_degrees : [];
  const requiredDegrees = Array.isArray(educationAnalysis.required_degrees) ? educationAnalysis.required_degrees : [];
  const completenessSections = Array.isArray(completenessDetails.details) ? completenessDetails.details : [];
  const aiSuggestions = analysis.ai_suggestions;
  const recommendations: string[] = [];
  if (missingSkills.length > 0) {
    recommendations.push(
      `If you have hands-on experience with ${missingSkills.slice(0, 5).join(', ')}, make that experience explicit in a relevant project or work entry. Only list skills you can support.`
    );
  } else if (matchedSkills.length > 0) {
    recommendations.push(
      'Your resume contains all detected required skills. Strengthen the match by showing the scope and results of the projects where you used them.'
    );
  }
  if (missingKeywords.length > 0) {
    recommendations.push(
      `Where accurate, use job-specific language such as ${missingKeywords.slice(0, 5).join(', ')} in the relevant resume sections.`
    );
  }
  const absentSections = completenessSections
    .filter((section: { section: string; present: boolean }) => !section.present)
    .map((section: { section: string }) => section.section.toLowerCase());
  if (absentSections.length > 0) {
    recommendations.push(
      `Add or complete these sections if you have relevant information: ${absentSections.join(', ')}.`
    );
  }

  const keywordCoverage = matchedKeywords.length + missingKeywords.length > 0
    ? Math.round((matchedKeywords.length / (matchedKeywords.length + missingKeywords.length)) * 100)
    : 100;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Report</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(analysis.created_at)}</p>
          </div>
        </div>
        <Button variant="danger" onClick={() => setDeleteModal(true)}>
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>

      {/* Company info */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{analysis.company_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{analysis.job_role}</span>
            </div>
            {analysis.job_location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{analysis.job_location}</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Score section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Big score */}
        <Card>
          <CardHeader>
            <CardTitle>ATS-style Compatibility</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="relative h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={scoreData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}%</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">{getScoreLabel(score)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                This score is an estimate generated using our matching algorithm and does not represent
                the scoring algorithm used by any specific employer's ATS.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Score breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <ProgressBar label="Skills Match" value={Number(analysis.skills_score)} max={50} showValue={false} />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Skills Match (50%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{Number(analysis.skills_score)}/50</span>
                </div>
                <ProgressBar label="Keyword Match" value={Number(analysis.keyword_score)} max={20} showValue={false} color="bg-purple-500" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Keyword Match (20%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{Number(analysis.keyword_score)}/20</span>
                </div>
                <ProgressBar label="Experience Match" value={Number(analysis.experience_score)} max={15} showValue={false} color="bg-cyan-500" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Experience Match (15%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{Number(analysis.experience_score)}/15</span>
                </div>
                <ProgressBar label="Education Match" value={Number(analysis.education_score)} max={10} showValue={false} color="bg-green-500" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Education Match (10%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{Number(analysis.education_score)}/10</span>
                </div>
                <ProgressBar label="Resume Completeness" value={Number(analysis.completeness_score)} max={5} showValue={false} color="bg-yellow-500" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Completeness (5%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{Number(analysis.completeness_score)}/5</span>
                </div>
              </div>
              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={breakdownData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                    <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(31 41 55)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {breakdownData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <CardTitle>Matched Skills ({matchedSkills.length})</CardTitle>
            </div>
          </CardHeader>
          <CardBody>
            {matchedSkills.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No skills matched.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((skill) => (
                  <Badge key={skill} variant="success">{skill}</Badge>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <CardTitle>Missing Skills ({missingSkills.length})</CardTitle>
            </div>
          </CardHeader>
          <CardBody>
            {missingSkills.length === 0 ? (
              <p className="text-sm text-green-600 dark:text-green-400">All required skills are present in your resume!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill) => (
                  <Badge key={skill} variant="danger">{skill}</Badge>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Keywords */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Keyword Analysis</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{matchedKeywords.length + missingKeywords.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Keywords</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{matchedKeywords.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Matched</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{missingKeywords.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Missing</p>
            </div>
          </div>

          <ProgressBar label="Keyword Coverage" value={keywordCoverage} color={keywordCoverage >= 70 ? 'bg-green-500' : keywordCoverage >= 50 ? 'bg-yellow-500' : 'bg-red-500'} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3">Matched Keywords</h4>
              {matchedKeywords.length === 0 ? (
                <p className="text-sm text-gray-400">None</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {matchedKeywords.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 text-xs rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">{kw}</span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3">Missing Keywords</h4>
              {missingKeywords.length === 0 ? (
                <p className="text-sm text-green-600 dark:text-green-400">All keywords covered!</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {missingKeywords.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 text-xs rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">{kw}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Experience & Education */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              <CardTitle>Experience Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardBody>
            {Object.keys(experienceAnalysis).length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Required:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {experienceAnalysis.required_years != null ? `${experienceAnalysis.required_years}+ years` : experienceAnalysis.is_fresher_role ? 'Entry level' : 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Your Resume:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {experienceAnalysis.resume_years != null ? `${experienceAnalysis.resume_years} years` : 'Not detected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Match:</span>
                  {experienceAnalysis.match_level === 'good' ? (
                    <Badge variant="success">Met</Badge>
                  ) : (
                    <Badge variant="warning">Partial</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Score:</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(experienceAnalysis.score * 100)}%</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">{experienceAnalysis.message || 'No additional experience details.'}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No experience data available.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-green-500" />
              <CardTitle>Education Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardBody>
            {Object.keys(educationAnalysis).length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Required:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {requiredDegrees.length > 0 ? requiredDegrees.join(', ') : 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Your Resume:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {resumeDegrees.length > 0 ? resumeDegrees.join(', ') : 'Not detected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Match:</span>
                  {educationAnalysis.match_level === 'good' ? (
                    <Badge variant="success">Met</Badge>
                  ) : (
                    <Badge variant="warning">Partial</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Score:</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(educationAnalysis.score * 100)}%</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">{educationAnalysis.message || 'No additional education details.'}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No education data available.</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Completeness */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-yellow-500" />
            <CardTitle>Resume Completeness</CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          {Object.keys(completenessDetails).length > 0 ? (
            <div>
              <div className="mb-6">
                <ProgressBar
                  label="Completeness Score"
                  value={completenessDetails.percentage}
                  color={completenessDetails.percentage >= 80 ? 'bg-green-500' : completenessDetails.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {completenessSections.map((section: { section: string; present: boolean }) => (
                  <div
                    key={section.section}
                    className={`flex items-center gap-2 p-3 rounded-lg ${section.present ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}
                  >
                    {section.present ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{section.section}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No completeness data available.</p>
          )}
        </CardBody>
      </Card>

      {/* Recommendations based on the actual resume and job description analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardBody>
          {recommendations.length > 0 ? (
            <ul className="space-y-2">
              {recommendations.map((recommendation) => (
                <li key={recommendation} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No specific gaps were detected. Keep your resume focused on relevant experience and measurable results.
            </p>
          )}
        </CardBody>
      </Card>

      {/* AI Insights */}
      {aiSuggestions && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <CardTitle>AI Resume Insights</CardTitle>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            {aiSuggestions.strengths && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-green-500" />
                  Resume Strengths
                </h4>
                <ul className="space-y-1.5">
                  {aiSuggestions.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiSuggestions.improvements && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Recommended Improvements
                </h4>
                <ul className="space-y-1.5">
                  {aiSuggestions.improvements.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-yellow-500 flex-shrink-0 mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiSuggestions.improved_summary && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Suggested Professional Summary
                </h4>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">{aiSuggestions.improved_summary}</p>
                </div>
              </div>
            )}

            {aiSuggestions.skills_to_learn && aiSuggestions.skills_to_learn.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Most Relevant Missing Skills to Learn</h4>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.skills_to_learn.map((s: string) => (
                    <Badge key={s} variant="warning">{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {aiSuggestions.project_suggestions && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Project Improvement Suggestions</h4>
                <ul className="space-y-1.5">
                  {aiSuggestions.project_suggestions.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Delete modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Analysis?" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete this analysis? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
