import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, CheckCircle2, ChevronRight, BookOpen, AlertCircle, Building2, Tag, ArrowRight } from 'lucide-react';

interface ProblemSummary {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  isStriverSheet: boolean;
  solved: boolean;
  topics: { name: string }[];
  companies?: { name: string }[];
  problemStatement?: string;
}

export const Problems: React.FC = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<ProblemSummary | null>(null);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const [isStriver, setIsStriver] = useState('');
  const [topic, setTopic] = useState('');
  
  const topicsList = [
    'Basic Syntax', 'Control Flow', 'Loops', 'Patterns',
    'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 
    'Binary Tree', 'BST', 'Dynamic Programming', 'Graphs', 
    'Sorting', 'Recursion', 'Hashing', 'Math'
  ];

  const fetchProblems = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (search) params.q = search;
      if (difficulty) params.difficulty = difficulty;
      if (category) params.category = category;
      if (isStriver) params.isStriver = isStriver;
      if (topic) params.topic = topic;

      const response = await api.get('/problems', { params });
      const data = response.data.problems;
      setProblems(data);
      
      // Auto-select first problem in the list if none selected or if previously selected is not in the new list
      if (data.length > 0) {
        setSelectedProblem(data[0]);
      } else {
        setSelectedProblem(null);
      }
    } catch (err: any) {
      setError('Failed to fetch coding problems. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProblems();
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [search, difficulty, category, isStriver, topic]);

  const getDifficultyColor = (diff: string) => {
    const d = diff.toUpperCase();
    if (d === 'EASY') return 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20';
    if (d === 'MEDIUM') return 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/20';
    return 'text-red-500 bg-red-500/10 dark:bg-red-500/20';
  };

  const cleanDescriptionSnippet = (stmt?: string) => {
    if (!stmt) return 'No description available for this problem.';
    // Strip markdown or HTML if simple, trim down
    const clean = stmt.replace(/[#*`]/g, '').trim();
    if (clean.length > 250) {
      return clean.substring(0, 250) + '...';
    }
    return clean;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white m-0 tracking-tight leading-none">
            Coding Challenges
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse and solve DSA challenges with Monaco Editor
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-light-border dark:bg-dark-card dark:border-dark-border rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems by title or content..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50/50 text-sm rounded-xl focus:border-brand-secondary focus:bg-white focus:outline-none dark:border-dark-border dark:bg-gray-800/40 dark:focus:border-brand-secondary dark:focus:bg-gray-900/60 dark:text-white transition-all text-input"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 bg-white text-xs font-semibold rounded-xl focus:outline-none focus:border-brand-secondary dark:border-dark-border dark:bg-gray-850 dark:text-white cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="DSA">DSA</option>
              <option value="Java">Java</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-200 bg-white text-xs font-semibold rounded-xl focus:outline-none focus:border-brand-secondary dark:border-dark-border dark:bg-gray-850 dark:text-white cursor-pointer"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Curriculum Filter */}
            <select
              value={isStriver}
              onChange={(e) => setIsStriver(e.target.value)}
              className="px-3 py-2 border border-gray-200 bg-white text-xs font-semibold rounded-xl focus:outline-none focus:border-brand-secondary dark:border-dark-border dark:bg-gray-850 dark:text-white cursor-pointer"
            >
              <option value="">All Curriculums</option>
              <option value="true">DSA Prep Sheet Only</option>
              <option value="false">Standalone Problems</option>
            </select>

            {/* Topic Filter */}
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="px-3 py-2 border border-gray-200 bg-white text-xs font-semibold rounded-xl focus:outline-none focus:border-brand-secondary dark:border-dark-border dark:bg-gray-850 dark:text-white cursor-pointer"
            >
              <option value="">All Topics</option>
              {topicsList.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm rounded-xl border border-red-500/10 bg-red-500/5 text-red-500 dark:bg-red-500/10">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ================= SPLIT PANE CONTAINER ================= */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column (65% width): Problems List Table */}
        <div className="w-full lg:w-[65%] shrink-0">
          {loading ? (
            <div className="py-24 text-center text-gray-400 bg-white border border-light-border rounded-2xl dark:bg-dark-card dark:border-dark-border">
              Loading problems list...
            </div>
          ) : problems.length === 0 ? (
            <div className="py-24 text-center text-gray-400 border border-dashed border-light-border dark:border-dark-border rounded-2xl bg-white dark:bg-dark-card">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="font-bold">No coding problems match your filters.</p>
            </div>
          ) : (
            <div className="bg-white border border-light-border rounded-2xl dark:bg-dark-card dark:border-dark-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-view">
                  <thead>
                    <tr>
                      <th className="w-12 text-center">Solved</th>
                      <th>Problem Name</th>
                      <th className="w-24">Difficulty</th>
                      <th className="w-24">Category</th>
                      <th className="w-36">Topic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problems.map((problem) => {
                      const isSelected = selectedProblem?.id === problem.id;
                      return (
                        <tr 
                          key={problem.id} 
                          onClick={() => setSelectedProblem(problem)}
                          onDoubleClick={() => navigate(`/problems/${problem.slug}`)}
                          className={`cursor-pointer transition-all duration-150 ${
                            isSelected 
                              ? 'bg-brand-primary/5 dark:bg-brand-secondary/5 border-l-4 border-brand-secondary' 
                              : ''
                          }`}
                        >
                          <td className="text-center">
                            {problem.solved ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-200 dark:border-gray-700 mx-auto" />
                            )}
                          </td>
                          <td className="font-bold text-gray-800 dark:text-gray-200">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span>{problem.title}</span>
                              {problem.isStriverSheet && (
                                <span className="px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 text-[8px] font-black uppercase tracking-wider">
                                  DSA Prep
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </td>
                          <td className="text-gray-500 dark:text-gray-400">
                            {problem.category}
                          </td>
                          <td>
                            <span className="text-xs text-gray-400">
                              {problem.topics[0]?.name || 'Uncategorized'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (35% width): Selected Problem Preview Card */}
        <div className="flex-1">
          {selectedProblem ? (
            <div className="card space-y-5 sticky top-20 flex flex-col justify-between min-h-[420px]">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-heading font-black text-xl text-gray-800 dark:text-white m-0">
                    {selectedProblem.title}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${getDifficultyColor(selectedProblem.difficulty)}`}>
                    {selectedProblem.difficulty}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 font-semibold border border-light-border dark:border-dark-border">
                    {selectedProblem.category}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 font-semibold border border-light-border dark:border-dark-border">
                    {selectedProblem.isStriverSheet ? 'DSA Prep Sheet' : 'Standalone'}
                  </span>
                </div>

                {/* Topics Section */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Topic Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProblem.topics.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-brand-secondary/5 text-brand-secondary dark:bg-brand-secondary/10 border border-brand-secondary/20 text-xs font-semibold">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Companies Section */}
                {selectedProblem.companies && selectedProblem.companies.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Top Asked Companies
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProblem.companies.map((c, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-amber-500/5 text-amber-500 border border-amber-500/20 text-xs font-semibold">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description Snippet */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Problem Statement Preview
                  </h4>
                  <div className="p-3 bg-gray-50/50 dark:bg-gray-800/10 rounded-lg border border-light-border dark:border-dark-border text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-sans select-none overflow-hidden max-h-[140px]">
                    {cleanDescriptionSnippet(selectedProblem.problemStatement)}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-light-border dark:border-dark-border">
                <Link
                  to={`/problems/${selectedProblem.slug}`}
                  className="btn-primary w-full flex items-center justify-center gap-2 group text-sm"
                >
                  Solve Challenge
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          ) : (
            <div className="card text-center py-12 text-gray-400 flex flex-col items-center justify-center min-h-[420px] border border-dashed border-light-border dark:border-dark-border">
              <ChevronRight className="w-8 h-8 mb-2 animate-pulse" />
              <p className="text-sm font-semibold">Select a problem from the list to preview details.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

