import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  GraduationCap, 
  Clock, 
  Award, 
  ArrowRight, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle,
  History,
  BookOpen
} from 'lucide-react';

interface Question {
  id: string;
  category: string;
  difficulty: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string; // 'A', 'B', 'C', 'D'
  explanation: string | null;
}

interface QuizAttempt {
  id: string;
  category: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  attemptedAt: string;
}

export const MockQuizzes: React.FC = () => {
  // Navigation stages: 'setup' | 'quiz' | 'results'
  const [stage, setStage] = useState<'setup' | 'quiz' | 'results'>('setup');
  
  // Setup States
  const [category, setCategory] = useState('DSA');
  const [difficulty, setDifficulty] = useState('Easy');
  const [limit, setLimit] = useState(10);
  
  // Quiz Active States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({}); // index -> option ('A', 'B' etc)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // History States
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Timer States
  const [timer, setTimer] = useState(0); // in seconds
  const [timerInterval, setTimerInterval] = useState<any>(null);

  // Score states
  const [finalScore, setFinalScore] = useState(0);

  // Categories list
  const categories = ['DSA', 'Java', 'DBMS', 'OS', 'Networks', 'HR'];

  // Fetch mock history
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get('/mock/history');
      setHistory(response.data.history);
    } catch (err) {
      console.error('Failed to load mock history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (stage === 'setup') {
      fetchHistory();
    }
  }, [stage]);

  // Start Timer
  const startTimer = () => {
    setTimer(0);
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  // Stop Timer
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  };

  const startQuiz = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/mock/questions', {
        params: { category, difficulty, limit }
      });
      setQuestions(response.data.questions);
      setAnswers({});
      setCurrentIdx(0);
      setStage('quiz');
      startTimer();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to retrieve quiz questions. Try changing criteria.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentIdx]: option
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitQuiz = async () => {
    stopTimer();
    
    // Calculate score
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOption) {
        score++;
      }
    });

    setFinalScore(score);
    setStage('results');
    
    // Save attempt to database
    try {
      await api.post('/mock/submit', {
        category,
        difficulty,
        score,
        totalQuestions: questions.length,
        timeTakenSeconds: timer
      });
    } catch (err) {
      console.error('Failed to save scorecard', err);
    }
  };

  const resetQuiz = () => {
    stopTimer();
    setStage('setup');
    setQuestions([]);
    setAnswers({});
    setTimer(0);
  };

  useEffect(() => {
    return () => stopTimer();
  }, [timerInterval]);

  return (
    <div className="space-y-6">
      
      {/* 1. SETUP STAGE (SPLIT VIEW) */}
      {stage === 'setup' && (
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column: Configure Mock Card */}
          <div className="w-full lg:w-[45%] shrink-0">
            <div className="card space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-light-border dark:border-dark-border">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-gray-800 dark:text-white m-0">
                    Configure Mock MCQ Test
                  </h3>
                  <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Custom Exam Generator</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm rounded-xl border border-red-500/10 bg-red-500/5 text-red-500 dark:bg-red-500/10">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Category selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Choose Subject
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 bg-white dark:border-dark-border dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:border-brand-secondary cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Choose Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 bg-white dark:border-dark-border dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:border-brand-secondary cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                {/* Question limits (Radios) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Number of Questions
                  </label>
                  <div className="flex gap-4">
                    {[10, 15, 20].map(n => (
                      <label key={n} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input 
                          type="radio" 
                          name="numQuestions" 
                          value={n} 
                          checked={limit === n} 
                          onChange={() => setLimit(n)} 
                          className="accent-brand-secondary"
                        />
                        {n} Questions
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={startQuiz}
                disabled={loading}
                className="w-full py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold transition-all shadow-md shadow-brand-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Retrieving Questions...' : 'Start Mock Exam'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Right Column: Guidelines & Recent Test History */}
          <div className="flex-1 space-y-6">
            
            {/* Guidelines Card */}
            <div className="card space-y-4">
              <h3 className="font-heading font-black text-sm text-gray-800 dark:text-white m-0 uppercase tracking-wider">
                Exam Guidelines
              </h3>
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-2 list-disc pl-4 leading-relaxed">
                <li><strong>Timer:</strong> The test is timed. Monitor the active counter in the upper right.</li>
                <li><strong>Scoring:</strong> You gain XP for correct solves. Completed mock sessions award 50 XP base directly to your Profile Level.</li>
                <li><strong>No Negatives:</strong> Answer all questions. Incorrect selections do not deduct points.</li>
                <li><strong>Results:</strong> Immediate scorecards, correct responses, and topic explanations are shown upon submission.</li>
              </ul>
            </div>

            {/* Test History Card */}
            <div className="card space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-light-border dark:border-dark-border">
                <History className="w-4 h-4 text-brand-secondary" />
                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider m-0">
                  Recent Mock Exam History
                </h4>
              </div>
              
              {loadingHistory ? (
                <div className="py-4 text-center text-xs text-gray-400">
                  Loading mock history...
                </div>
              ) : history.length === 0 ? (
                <div className="py-8 text-center text-gray-400 border border-dashed border-light-border dark:border-dark-border rounded-xl">
                  <BookOpen className="w-6 h-6 mx-auto mb-1 text-gray-350 dark:text-gray-600" />
                  <p className="text-xs font-semibold">No mock exams attempted yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table-view">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Difficulty</th>
                        <th>Score</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 4).map((attempt) => {
                        const percent = Math.round((attempt.score / attempt.totalQuestions) * 100);
                        return (
                          <tr key={attempt.id} className="text-xs">
                            <td className="font-bold">{attempt.category}</td>
                            <td>{attempt.difficulty}</td>
                            <td>{attempt.score}/{attempt.totalQuestions} ({percent}%)</td>
                            <td className="text-gray-400">{new Date(attempt.attemptedAt).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 2. ACTIVE QUIZ STAGE */}
      {stage === 'quiz' && questions.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Header metadata bar */}
          <div className="flex items-center justify-between p-4 bg-white border border-light-border dark:bg-dark-card dark:border-dark-border rounded-xl shadow-sm shrink-0">
            <span className="text-xs font-bold text-gray-400">
              Question {currentIdx + 1} of {questions.length} • {category} ({difficulty})
            </span>
            <div className="flex items-center gap-1.5 text-brand-primary text-sm font-bold bg-brand-primary/10 px-3 py-1 rounded-lg">
              <Clock className="w-4 h-4" />
              {formatTime(timer)}
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white border border-light-border dark:bg-dark-card dark:border-dark-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-heading font-bold text-lg leading-relaxed text-gray-800 dark:text-white">
              {questions[currentIdx].text}
            </h3>

            {/* Answer Options list */}
            <div className="space-y-3">
              {[
                { label: 'A', text: questions[currentIdx].optionA },
                { label: 'B', text: questions[currentIdx].optionB },
                { label: 'C', text: questions[currentIdx].optionC },
                { label: 'D', text: questions[currentIdx].optionD }
              ].map((opt) => {
                const selected = answers[currentIdx] === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleSelectOption(opt.label)}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all flex items-center gap-3 cursor-pointer ${
                      selected 
                        ? 'border-brand-secondary bg-brand-secondary/5 dark:bg-brand-secondary/10 text-brand-secondary'
                        : 'border-gray-200 dark:border-dark-border hover:bg-gray-50/50 dark:hover:bg-gray-800/10'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      selected
                        ? 'bg-brand-secondary text-white'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {opt.label}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer Navigation buttons */}
            <div className="flex items-center justify-between border-t border-light-border dark:border-dark-border pt-4">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="flex items-center gap-1 px-4 py-2 border border-gray-200 dark:border-dark-border rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {currentIdx === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  Submit Scorecard
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-200 dark:border-dark-border rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. RESULTS SCOREBOARD STAGE */}
      {stage === 'results' && questions.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          {/* Summary Scorecard Card */}
          <div className="bg-white border border-light-border dark:bg-dark-card dark:border-dark-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl font-bold">
              <Award className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h2 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-white">
                Mock Quiz Completed!
              </h2>
              <p className="text-sm text-gray-500">
                Subject: {category} • Difficulty: {difficulty}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-light-border dark:border-dark-border flex items-center gap-8 text-center divide-x divide-gray-200 dark:divide-dark-border">
              <div className="px-4">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                  Final Score
                </span>
                <span className="text-2xl font-black text-brand-primary">
                  {finalScore} / {questions.length}
                </span>
              </div>
              <div className="px-8">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                  Time Taken
                </span>
                <span className="text-2xl font-black text-gray-700 dark:text-gray-200">
                  {formatTime(timer)}
                </span>
              </div>
            </div>

            <button
              onClick={resetQuiz}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-brand-primary/10 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Attempt Another Quiz
            </button>
          </div>

          {/* Detailed Review section */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg text-gray-800 dark:text-white pl-2">
              Detailed Question Review
            </h3>

            {questions.map((q, idx) => {
              const userAns = answers[idx];
              const isCorrect = userAns === q.correctOption;
              const options = [
                { key: 'A', val: q.optionA },
                { key: 'B', val: q.optionB },
                { key: 'C', val: q.optionC },
                { key: 'D', val: q.optionD }
              ];

              return (
                <div 
                  key={q.id} 
                  className={`border rounded-2xl bg-white dark:bg-dark-card p-6 space-y-4 shadow-sm ${
                    isCorrect 
                      ? 'border-emerald-500/20' 
                      : 'border-red-500/20'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-xs font-bold text-gray-400">
                      Question {idx + 1}
                    </span>
                    {isCorrect ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                        Correct
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 flex items-center gap-1">
                        Incorrect
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-sm text-gray-800 dark:text-white leading-relaxed">
                    {q.text}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {options.map((opt) => {
                      const selected = userAns === opt.key;
                      const correct = q.correctOption === opt.key;
                      
                      let optionStyle = 'border-gray-100 bg-gray-50/50 dark:border-dark-border dark:bg-gray-800/10';
                      if (correct) optionStyle = 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold';
                      else if (selected) optionStyle = 'border-red-500 bg-red-500/5 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold';

                      return (
                        <div key={opt.key} className={`p-3 rounded-xl border flex items-center gap-2 ${optionStyle}`}>
                          <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            correct 
                              ? 'bg-emerald-500 text-white' 
                              : selected 
                                ? 'bg-red-500 text-white' 
                                : 'bg-gray-200 dark:bg-gray-700'
                          }`}>
                            {opt.key}
                          </span>
                          <span>{opt.val}</span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-4 rounded-xl bg-gray-50/80 border border-light-border dark:bg-gray-800/10 dark:border-dark-border text-xs text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                      <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Explanation:</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
