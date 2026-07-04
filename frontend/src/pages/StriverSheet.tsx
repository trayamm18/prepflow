import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface StriverProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  solved: boolean;
}

interface StriverTopic {
  topicName: string;
  problems: StriverProblem[];
}

interface StriverStep {
  stepName: string;
  topics: StriverTopic[];
}

export const StriverSheet: React.FC = () => {
  const [sheetData, setSheetData] = useState<StriverStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Accordion states: maps stepName to boolean
  const [openSteps, setOpenSteps] = useState<{ [key: string]: boolean }>({});
  
  // Selected topic path
  const [selectedTopic, setSelectedTopic] = useState<{ stepName: string; topicName: string } | null>(null);

  const [search, setSearch] = useState('');

  const fetchStriverProgress = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/problems/striver');
      const data = response.data.striverSheet;
      setSheetData(data);
      
      if (data.length > 0) {
        // Expand first step and select first topic
        const firstStep = data[0].stepName;
        setOpenSteps({ [firstStep]: true });
        
        if (data[0].topics.length > 0) {
          setSelectedTopic({
            stepName: firstStep,
            topicName: data[0].topics[0].topicName
          });
        }
      }
    } catch (err) {
      setError('Failed to load Striver curriculum. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStriverProgress();
  }, []);

  const toggleStep = (stepName: string) => {
    setOpenSteps(prev => ({
      ...prev,
      [stepName]: !prev[stepName]
    }));
  };

  // Calculate overall progress stats
  const progressStats = useMemo(() => {
    let totalProblems = 0;
    let solvedProblems = 0;
    
    sheetData.forEach(step => {
      step.topics.forEach(t => {
        t.problems.forEach(p => {
          totalProblems++;
          if (p.solved) solvedProblems++;
        });
      });
    });

    const percent = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 1000) / 10 : 0;
    return { totalProblems, solvedProblems, percent };
  }, [sheetData]);

  // Selected topic details
  const selectedTopicData = useMemo(() => {
    if (!selectedTopic) return null;
    const step = sheetData.find(s => s.stepName === selectedTopic.stepName);
    if (!step) return null;
    return step.topics.find(t => t.topicName === selectedTopic.topicName);
  }, [sheetData, selectedTopic]);

  const filteredProblems = useMemo(() => {
    if (!selectedTopicData) return [];
    if (!search) return selectedTopicData.problems;
    const cleanSearch = search.toLowerCase().trim();
    return selectedTopicData.problems.filter(p => p.title.toLowerCase().includes(cleanSearch));
  }, [selectedTopicData, search]);

  const getDifficultyColor = (diff: string) => {
    const d = diff.toUpperCase();
    if (d === 'EASY') return 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20';
    if (d === 'MEDIUM') return 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/20';
    return 'text-red-500 bg-red-500/10 dark:bg-red-500/20';
  };

  return (
    <div className="space-y-6">
      
      {/* Header section with overall progress bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white m-0 tracking-tight leading-none">
            DSA Prep Sheet
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Complete preparation curriculum structured into Steps & Topics
          </p>
        </div>

        {/* Progress summary card */}
        <div className="p-4 bg-white border border-light-border dark:bg-dark-card dark:border-dark-border rounded-xl shadow-sm flex flex-col justify-center min-w-[240px]">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="text-gray-400">Sheet Progress</span>
            <span className="text-brand-primary dark:text-brand-secondary">{progressStats.solvedProblems}/{progressStats.totalProblems} ({progressStats.percent}%)</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-secondary rounded-full transition-all duration-500"
              style={{ width: `${progressStats.percent}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm rounded-xl border border-red-500/10 bg-red-500/5 text-red-500 dark:bg-red-500/10">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-gray-400 bg-white border border-light-border rounded-2xl dark:bg-dark-card dark:border-dark-border">
          Loading DSA Prep Sheet progress...
        </div>
      ) : sheetData.length === 0 ? (
        <div className="py-12 text-center text-gray-400 border border-dashed border-light-border dark:border-dark-border rounded-2xl bg-white dark:bg-dark-card">
          No roadmap items found in database.
        </div>
      ) : (
        /* ================= SPLIT PANE CONTAINER ================= */
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Pane (25% width): Steps & Topics Tree */}
          <div className="w-full lg:w-[28%] shrink-0 space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
              Curriculum Steps
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {sheetData.map((step) => {
                const isStepOpen = !!openSteps[step.stepName];
                
                // Calculate solved count in this step
                let stepTotal = 0;
                let stepSolved = 0;
                step.topics.forEach(t => {
                  t.problems.forEach(p => {
                    stepTotal++;
                    if (p.solved) stepSolved++;
                  });
                });

                return (
                  <div 
                    key={step.stepName} 
                    className="border border-light-border dark:border-dark-border rounded-xl bg-white dark:bg-dark-card overflow-hidden shadow-sm transition-all"
                  >
                    {/* Step Name Toggle */}
                    <button
                      onClick={() => toggleStep(step.stepName)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/10 text-left font-bold text-xs text-gray-700 dark:text-gray-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 max-w-[85%]">
                        <span className="flex items-center justify-center min-w-[32px] h-5 px-1 bg-brand-primary/10 text-brand-primary text-[9px] font-black dark:bg-brand-primary/20 rounded">
                          {stepSolved}/{stepTotal}
                        </span>
                        <span className="truncate">{step.stepName}</span>
                      </div>
                      {isStepOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Step Topics List */}
                    {isStepOpen && (
                      <div className="border-t border-light-border dark:border-dark-border p-2 bg-gray-50/20 dark:bg-gray-900/10 space-y-1">
                        {step.topics.map((topic) => {
                          const isSelected = selectedTopic?.stepName === step.stepName && selectedTopic?.topicName === topic.topicName;
                          const topicTotal = topic.problems.length;
                          const topicSolved = topic.problems.filter(p => p.solved).length;
                          const isComplete = topicSolved === topicTotal && topicTotal > 0;

                          return (
                            <button
                              key={topic.topicName}
                              onClick={() => setSelectedTopic({ stepName: step.stepName, topicName: topic.topicName })}
                              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between transition-all ${
                                isSelected 
                                  ? 'bg-brand-secondary/10 text-brand-secondary border-l-2 border-brand-secondary' 
                                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/30'
                              }`}
                            >
                              <span className="truncate max-w-[80%]">{topic.topicName}</span>
                              <span className={`text-[9px] font-bold ${isComplete ? 'text-emerald-500' : 'text-gray-400'}`}>
                                {topicSolved}/{topicTotal}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Pane (72% width): Selected Topic Problems Table */}
          <div className="flex-1 space-y-6">
            {selectedTopicData ? (
              <div className="card space-y-5">
                {/* Topic Header & Details */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-light-border dark:border-dark-border">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      {selectedTopic?.stepName}
                    </span>
                    <h2 className="font-heading font-black text-xl text-gray-800 dark:text-white m-0 mt-1">
                      {selectedTopic?.topicName}
                    </h2>
                  </div>

                  {/* Topic specific progress bar */}
                  {(() => {
                    const total = selectedTopicData.problems.length;
                    const solved = selectedTopicData.problems.filter(p => p.solved).length;
                    const percent = total > 0 ? Math.round((solved / total) * 100) : 0;
                    return (
                      <div className="min-w-[180px] space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-brand-secondary">{solved}/{total} solved ({percent}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-secondary rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Search box inside Right Pane */}
                <div className="relative max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search problems in this topic..."
                    className="w-full pl-10 pr-4 py-1.5 border border-gray-200 bg-gray-50/50 text-xs rounded-xl focus:border-brand-secondary focus:bg-white focus:outline-none dark:border-dark-border dark:bg-gray-800/40 dark:focus:border-brand-secondary dark:focus:bg-gray-900/60 dark:text-white transition-all text-input"
                  />
                </div>

                {/* Problems list */}
                <div className="overflow-x-auto">
                  <table className="table-view">
                    <thead>
                      <tr>
                        <th className="w-12 text-center">Solved</th>
                        <th>Problem Name</th>
                        <th className="w-24">Difficulty</th>
                        <th className="w-28 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProblems.map((problem) => (
                        <tr key={problem.id}>
                          <td className="text-center">
                            {problem.solved ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-200 dark:border-gray-700 mx-auto" />
                            )}
                          </td>
                          <td className="font-bold text-gray-800 dark:text-gray-200">
                            {problem.title}
                          </td>
                          <td>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </td>
                          <td className="text-center">
                            <Link
                              to={`/problems/${problem.slug}`}
                              className="btn-primary text-xs py-1 px-3 inline-flex items-center gap-1.5 group"
                            >
                              Solve
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            ) : (
              <div className="card text-center py-24 text-gray-400 border border-dashed border-light-border dark:border-dark-border flex flex-col items-center justify-center">
                <BookOpen className="w-10 h-10 mb-3 text-gray-300 dark:text-gray-655" />
                <p className="font-semibold text-sm">Select a curriculum topic from the left sidebar tree to view details.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

