import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileSearch,
  Brain,
  Target,
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Github,
  Code2,
  Database,
  Cloud,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: FileSearch,
      title: 'PDF Resume Parsing',
      description: 'Upload your resume PDF and our system extracts text, skills, and sections automatically.',
    },
    {
      icon: Target,
      title: 'ATS-Style Matching',
      description: 'Our proprietary algorithm compares your resume against any job description and calculates a compatibility score.',
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Gemini AI analyzes your results and provides personalized improvement suggestions.',
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Visualize skill gaps, keyword coverage, experience, and education requirements with charts.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure & Private',
      description: 'Your data is protected with row-level security. Only you can see your resumes and analyses.',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Save analyses, compare scores over time, and watch your match scores improve.',
    },
  ];

  const steps = [
    { number: '01', title: 'Upload Your Resume', description: 'Upload a PDF resume. We extract the text and parse skills automatically.' },
    { number: '02', title: 'Paste Job Description', description: 'Enter the company name, job role, and paste the full job description.' },
    { number: '03', title: 'Get Your Score', description: 'Our algorithm calculates your ATS-style compatibility score with a detailed breakdown.' },
    { number: '04', title: 'Improve with AI', description: 'Get AI-powered suggestions to improve your resume and close skill gaps.' },
  ];

  const techStack = [
    { icon: Code2, name: 'React + Vite', category: 'Frontend' },
    { icon: Database, name: 'Supabase / PostgreSQL', category: 'Database' },
    { icon: Brain, name: 'Gemini AI', category: 'AI Integration' },
    { icon: Cloud, name: 'Edge Functions', category: 'Backend' },
    { icon: ShieldCheck, name: 'JWT Auth + RLS', category: 'Security' },
    { icon: BarChart3, name: 'Recharts', category: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">CareerMatch AI</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white dark:from-blue-950/20 dark:via-gray-900 dark:to-gray-900" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-200/20 dark:bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Resume Analysis
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">
            Match Your Resume With Your{' '}
            <span className="text-blue-600 dark:text-blue-400">Dream Job</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Analyze your resume against any job description, discover skill gaps, and improve your
            application with AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/analyze' : '/register'}
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30"
            >
              <FileSearch className="w-5 h-5" />
              Analyze My Resume
            </Link>
            {!user && (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Everything You Need to Land the Job
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to help you optimize your resume and increase your chances of getting shortlisted.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              How It Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Four simple steps to a better resume</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={step.number} className="relative">
                <div className="text-5xl font-bold text-blue-100 dark:text-blue-900/50 mb-2">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
                {idx < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-3 w-6 h-6 text-gray-300 dark:text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Technology Stack
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Built with modern, industry-standard tools</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <div
                  key={tech.name}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 text-center hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{tech.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tech.category}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits / CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Improve Your Resume?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join CareerMatch AI today and start optimizing your resume for every job application.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {[
              'Free to use',
              'No credit card required',
              'Instant results',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
          <Link
            to={user ? '/dashboard' : '/register'}
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              CareerMatch AI
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Match Your Resume With Your Dream Job
          </p>
          <div className="flex items-center gap-4 text-gray-400">
            <Github className="w-5 h-5" />
          </div>
        </div>
      </footer>
    </div>
  );
}
