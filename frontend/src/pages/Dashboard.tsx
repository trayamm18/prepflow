import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Heatmap } from '../components/Heatmap';
import api from '../services/api';
import { 
  Flame, 
  CheckCircle2, 
  History,
  GraduationCap,
  Users,
  Award,
  Lock,
  Code
} from 'lucide-react';

interface QuizAttempt {
  id: string;
  category: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  attemptedAt: string;
}

// Circular SVG Progress Gauge component matching JavaFX styling
const CircularProgress: React.FC<{ value: number; max: number; size?: number; strokeWidth?: number; color: string; label: string }> = ({
  value,
  max,
  size = 90,
  strokeWidth = 8,
  color,
  label
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = max > 0 ? Math.min(value / max, 1) : 0;
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-gray-200 dark:stroke-gray-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Text inside circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black leading-none text-gray-800 dark:text-white">{value}</span>
          <span className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-wider">{label}</span>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    // Refresh user profile stats on mount
    refreshUser();
    
    // Fetch mock history
    const fetchHistory = async () => {
      try {
        const response = await api.get('/mock/history');
        setAttempts(response.data.history);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoadingAttempts(false);
      }
    };
    fetchHistory();
  }, []);

  const totalSolved = (user?.solvedEasy || 0) + (user?.solvedMedium || 0) + (user?.solvedHard || 0);

  // Level & XP Formula matching JavaFX
  // Base 100 XP + Easy (10 XP) + Medium (20 XP) + Hard (30 XP) + Mock Attempts (50 XP)
  const totalXP = useMemo(() => {
    const easy = user?.solvedEasy || 0;
    const medium = user?.solvedMedium || 0;
    const hard = user?.solvedHard || 0;
    const mockXP = (attempts?.length || 0) * 50;
    return 100 + (easy * 10) + (medium * 20) + (hard * 30) + mockXP;
  }, [user, attempts]);

  const levelName = useMemo(() => {
    if (totalXP >= 3000) return 'Level 4 (FAANG Ready)';
    if (totalXP >= 1000) return 'Level 3 (Advanced Engineer)';
    if (totalXP >= 300) return 'Level 2 (Intermediate Developer)';
    return 'Level 1 (Beginner Coder)';
  }, [totalXP]);

  // Extract solved dates for heatmap from progress list
  const solvedDates = useMemo(() => {
    if (!user || !(user as any).progress) return [];
    return (user as any).progress
      .map((p: any) => p.solvedAt)
      .filter(Boolean);
  }, [user]);

  // Languages progress distribution
  const javaSolved = useMemo(() => {
    const easy = user?.solvedEasy || 0;
    const medium = user?.solvedMedium || 0;
    return Math.round(easy * 0.6 + medium * 0.4);
  }, [user]);

  const dsaSolved = useMemo(() => {
    const easy = user?.solvedEasy || 0;
    const medium = user?.solvedMedium || 0;
    const hard = user?.solvedHard || 0;
    return Math.round(easy * 0.4 + medium * 0.6 + hard);
  }, [user]);

  const latestAttempts = useMemo(() => {
    return attempts.slice(0, 5);
  }, [attempts]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* ================= LEFT SIDEBAR COLUMN (280px) ================= */}
      <div className="w-full lg:w-[280px] shrink-0 space-y-6">
        
        {/* Profile Card */}
        <div className="card text-center space-y-4 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-brand-primary/10 border-2 border-brand-secondary/40 flex items-center justify-center text-brand-primary font-black text-3xl">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-800 dark:text-white m-0">
              {user?.name}
            </h3>
            <span className="text-xs text-gray-400 block mt-0.5">@{user?.username}</span>
          </div>
          <div className="px-3 py-1 bg-brand-secondary/10 text-brand-secondary text-xs font-black rounded-full uppercase tracking-wider">
            {levelName}
          </div>
          <button
            onClick={() => setFollowing(!following)}
            className={`w-full py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
              following 
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700' 
                : 'btn-primary'
            }`}
          >
            {following ? '✓ Following' : 'Follow'}
          </button>
        </div>

        {/* Community Stats Card */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-light-border dark:border-dark-border">
            <Users className="w-4 h-4 text-brand-secondary" />
            <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider m-0">
              Community Stats
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-gray-50/50 dark:bg-gray-800/10 p-2 rounded border border-light-border dark:border-dark-border">
              <span className="text-lg font-black block text-gray-800 dark:text-white">0</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Views</span>
            </div>
            <div className="bg-gray-50/50 dark:bg-gray-800/10 p-2 rounded border border-light-border dark:border-dark-border">
              <span className="text-lg font-black block text-gray-800 dark:text-white">0</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Solutions</span>
            </div>
            <div className="bg-gray-50/50 dark:bg-gray-800/10 p-2 rounded border border-light-border dark:border-dark-border">
              <span className="text-lg font-black block text-gray-800 dark:text-white">0</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Discuss</span>
            </div>
            <div className="bg-gray-50/50 dark:bg-gray-800/10 p-2 rounded border border-light-border dark:border-dark-border">
              <span className="text-lg font-black block text-gray-800 dark:text-white">0</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Reputation</span>
            </div>
          </div>
        </div>

        {/* Languages Card */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-light-border dark:border-dark-border">
            <Code className="w-4 h-4 text-brand-primary" />
            <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider m-0">
              Languages
            </h4>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-gray-600 dark:text-gray-300">Java</span>
                <span>{javaSolved} Solved</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-primary rounded-full" 
                  style={{ width: `${totalSolved ? (javaSolved / totalSolved) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-gray-600 dark:text-gray-300">DSA</span>
                <span>{dsaSolved} Solved</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-secondary rounded-full" 
                  style={{ width: `${totalSolved ? (dsaSolved / totalSolved) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ================= RIGHT MAIN PANEL ================= */}
      <div className="flex-1 space-y-6 overflow-hidden">
        
        {/* Row 1: Solved Counts Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* MCQ Solved Circular Gauge */}
          <div className="card flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                MCQ QUIZZES
              </span>
              <h4 className="text-sm font-bold text-gray-800 dark:text-white m-0">
                Mock Exams
              </h4>
              <p className="text-xs text-gray-400">
                Completed attempts: {attempts.length}
              </p>
            </div>
            <CircularProgress 
              value={attempts.length} 
              max={25} 
              color="#3B82F6" 
              label="Quizzes"
            />
          </div>

          {/* Coding Solved Circular Gauge */}
          <div className="card flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                CODING SOLVED
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-emerald-500 font-bold">E: {user?.solvedEasy || 0}</span>
                <span className="text-[10px] text-amber-500 font-bold">M: {user?.solvedMedium || 0}</span>
                <span className="text-[10px] text-red-500 font-bold">H: {user?.solvedHard || 0}</span>
              </div>
              <div className="w-full h-1 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${totalSolved ? ((user?.solvedEasy || 0) / totalSolved) * 100 : 0}%` }}
                />
              </div>
            </div>
            <CircularProgress 
              value={totalSolved} 
              max={150} 
              color="#06B6D4" 
              label="Solved"
            />
          </div>

          {/* Badges Card */}
          <div className="card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                ACHIEVED BADGES
              </span>
              <span className="text-xs font-bold text-brand-secondary flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> 3 Badges
              </span>
            </div>
            
            <div className="flex gap-2">
              {/* Badge 1: Streak master */}
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center" title="Streak Master: Seeded on login">
                <Flame className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
              </div>
              {/* Badge 2: Coding ninja */}
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${
                totalSolved >= 5 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700'
              }`} title={totalSolved >= 5 ? 'Vibe Coder Unlocked' : 'Solve 5 problems to unlock'}>
                {totalSolved >= 5 ? <CheckCircle2 className="w-6 h-6" /> : <Lock className="w-4 h-4" />}
              </div>
              {/* Badge 3: Quizzer */}
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${
                attempts.length >= 1 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700'
              }`} title={attempts.length >= 1 ? 'Quiz Master Unlocked' : 'Take 1 Quiz to unlock'}>
                {attempts.length >= 1 ? <GraduationCap className="w-6 h-6" /> : <Lock className="w-4 h-4" />}
              </div>
            </div>
            <span className="text-[10px] text-gray-400 mt-2 block">
              Level XP: {totalXP} XP
            </span>
          </div>

        </div>

        {/* Row 2: Heatmap Contribution Section */}
        <Heatmap solvedDates={solvedDates} />

        {/* Row 3: Recent Submissions table */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-light-border dark:border-dark-border">
            <History className="w-5 h-5 text-brand-primary" />
            <h3 className="font-heading font-bold text-base text-gray-800 dark:text-white m-0">
              Recent Mock MCQ Scores
            </h3>
          </div>
          
          {loadingAttempts ? (
            <div className="py-8 flex justify-center items-center text-gray-400">
              Loading history...
            </div>
          ) : attempts.length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-gray-500 border border-dashed border-light-border dark:border-dark-border rounded-xl">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-semibold">No mock exams attempted yet.</p>
              <Link to="/mock" className="text-xs text-brand-primary font-bold hover:underline mt-1 inline-block">
                Take your first quiz ➔
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-view">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Date Attempted</th>
                    <th>Score</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {latestAttempts.map((attempt) => {
                    const percent = Math.round((attempt.score / attempt.totalQuestions) * 100);
                    const isGood = percent >= 70;
                    return (
                      <tr key={attempt.id}>
                        <td className="font-bold">{attempt.category} Quiz</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            attempt.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                            attempt.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {attempt.difficulty}
                          </span>
                        </td>
                        <td className="text-gray-400 text-xs">
                          {new Date(attempt.attemptedAt).toLocaleDateString()}
                        </td>
                        <td className="font-bold text-gray-600 dark:text-gray-300">
                          {attempt.score} / {attempt.totalQuestions}
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            isGood 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {percent}%
                          </span>
                        </td>
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
  );
};

