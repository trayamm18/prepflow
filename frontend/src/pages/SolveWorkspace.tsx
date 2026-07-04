import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Editor from '@monaco-editor/react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { 
  ChevronLeft, 
  Play, 
  Send, 
  FileText, 
  PenTool, 
  Save, 
  Loader2, 
  AlertCircle
} from 'lucide-react';

interface ProblemDetails {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  problemStatement: string;
  sampleInput: string;
  sampleOutput: string;
  hint1: string | null;
  hint2: string | null;
  codeTemplate: string;
  isStriverSheet: boolean;
  striverStep: string | null;
  striverTopic: string | null;
}

export const SolveWorkspace: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { darkMode } = useTheme();
  const { refreshUser } = useAuth();
  
  // State variables
  const [problem, setProblem] = useState<ProblemDetails | null>(null);
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Editor & Language configs
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState('');
  const [editorTheme, setEditorTheme] = useState('vs-dark');

  // Left panel Tabs: 'desc' | 'notes'
  const [activeTab, setActiveTab] = useState<'desc' | 'notes'>('desc');
  
  // Notes state
  const [noteText, setNoteText] = useState('');
  const [loadingNote, setLoadingNote] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  
  // Simulation states
  const [compiling, setCompiling] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [consoleStatus, setConsoleStatus] = useState<'success' | 'error' | null>(null);
  
  // Hints toggle
  const [showHint1, setShowHint1] = useState(false);
  const [showHint2, setShowHint2] = useState(false);

  useEffect(() => {
    setEditorTheme(darkMode ? 'vs-dark' : 'light');
  }, [darkMode]);

  const fetchProblemDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/problems/${slug}`);
      const data = response.data;
      setProblem(data.problem);
      setSolved(data.solved);
      setCode(data.problem.codeTemplate);
      
      // Load note for this problem
      fetchNote(data.problem.id);
    } catch (err: any) {
      setError('Problem details could not be loaded. It might not exist.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNote = async (problemId: string) => {
    setLoadingNote(true);
    try {
      const response = await api.get(`/notes/${problemId}`);
      setNoteText(response.data.markdownText || '');
    } catch (err) {
      // Quiet fail if guest or note retrieve fails
    } finally {
      setLoadingNote(false);
    }
  };

  const handleSaveNote = async () => {
    if (!problem) return;
    setSavingNote(true);
    try {
      await api.put(`/notes/${problem.id}`, { markdownText: noteText });
    } catch (err) {
      alert('Failed to save note. Please make sure you are signed in.');
    } finally {
      setSavingNote(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchProblemDetails();
    }
  }, [slug]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    // Configure Monaco properties if needed
    editor.focus();
  };

  const handleCompile = () => {
    setCompiling(true);
    setConsoleOutput(null);
    setConsoleStatus(null);

    setTimeout(() => {
      setCompiling(false);
      setConsoleStatus('success');
      setConsoleOutput(
        `[COMPILE] Compilation Successful.\n[TESTCASE 1] Input: ${problem?.sampleInput}\n[TESTCASE 1] Output: ${problem?.sampleOutput}\n[RESULT] All default mock test cases passed!`
      );
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setSubmitting(true);
    setConsoleOutput(null);
    setConsoleStatus(null);

    try {
      await api.post(`/problems/${problem.slug}/submit`, {
        code,
        language,
        timeTakenSeconds: Math.floor(60 + Math.random() * 120) // Simulated time
      });

      setTimeout(() => {
        setSubmitting(false);
        setConsoleStatus('success');
        setSolved(true);
        setConsoleOutput(
          `[SUBMIT] Solution accepted successfully!\n[STATS] Time: 120ms (beats 92% of Java submissions)\n[RESULT] Problem status marked as SOLVED.`
        );
        refreshUser(); // Refresh streaks & badges count on header
      }, 1500);
    } catch (err: any) {
      setSubmitting(false);
      setConsoleStatus('error');
      setConsoleOutput(
        `[SUBMIT] Submission failed: ${err.response?.data?.error || 'Make sure you are signed in to submit solutions.'}`
      );
    }
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === 'EASY') return 'text-emerald-500 bg-emerald-500/10';
    if (diff === 'MEDIUM') return 'text-amber-500 bg-amber-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-400">
        Loading coding workspace...
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="py-12 max-w-md mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="font-heading font-bold text-xl">Workspace Error</h2>
        <p className="text-sm text-gray-500">{error || 'Problem not found'}</p>
        <Link to="/problems" className="text-brand-primary font-bold hover:underline">
          ➔ Return to problem list
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8.5rem)]">
      {/* Workspace Header */}
      <div className="flex items-center justify-between border-b border-light-border dark:border-dark-border pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/problems"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-lg sm:text-xl m-0 tracking-tight">
                {problem.title}
              </h2>
              {solved && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Solved
                </span>
              )}
            </div>
            {problem.isStriverSheet && (
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                DSA Prep • {problem.striverStep} • {problem.striverTopic}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 bg-white dark:border-dark-border dark:bg-gray-800 rounded-lg text-xs font-bold focus:outline-none"
          >
            <option value="java">Java (JDK 17)</option>
            <option value="cpp">C++ (GCC 11)</option>
            <option value="python">Python (3.10)</option>
            <option value="javascript">JavaScript (Node 18)</option>
          </select>
        </div>
      </div>

      {/* Main Split Panels */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden min-h-0">
        {/* LEFT PANEL: Description & Notes */}
        <div className="border border-light-border dark:border-dark-border rounded-2xl bg-white dark:bg-dark-card flex flex-col min-h-0 overflow-hidden shadow-sm">
          {/* Panel Tabs */}
          <div className="flex border-b border-light-border dark:border-dark-border bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
            <button
              onClick={() => setActiveTab('desc')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'desc'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Description
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'notes'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              <PenTool className="w-4 h-4" />
              My Notes
            </button>
          </div>

          {/* Panel Content Container */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {activeTab === 'desc' ? (
              <div className="space-y-6">
                {/* Header elements */}
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Category: {problem.category}
                  </span>
                </div>

                {/* Problem Statement */}
                <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {problem.problemStatement}
                </div>

                {/* Examples */}
                <div className="space-y-3">
                  <h4 className="font-heading font-extrabold text-sm uppercase tracking-wider text-gray-400">
                    Sample Examples
                  </h4>
                  <div className="p-4 rounded-xl bg-gray-50 border border-light-border dark:bg-gray-800/30 dark:border-dark-border space-y-2 font-mono text-xs text-gray-800 dark:text-gray-200">
                    <div>
                      <span className="font-bold text-brand-primary">Input:</span> {problem.sampleInput}
                    </div>
                    <div>
                      <span className="font-bold text-brand-secondary">Output:</span> {problem.sampleOutput}
                    </div>
                  </div>
                </div>

                {/* Hints Section */}
                <div className="space-y-2 pt-2 border-t border-light-border dark:border-dark-border">
                  <h4 className="font-heading font-extrabold text-sm uppercase tracking-wider text-gray-400 mb-2">
                    Hints
                  </h4>
                  {problem.hint1 && (
                    <div>
                      <button
                        onClick={() => setShowHint1(!showHint1)}
                        className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        {showHint1 ? 'Hide Hint 1' : 'Show Hint 1'}
                      </button>
                      {showHint1 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 p-3 mt-1.5 bg-gray-50 dark:bg-gray-800/20 border border-light-border dark:border-dark-border rounded-xl">
                          {problem.hint1}
                        </p>
                      )}
                    </div>
                  )}

                  {problem.hint2 && (
                    <div>
                      <button
                        onClick={() => setShowHint2(!showHint2)}
                        className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1.5 cursor-pointer mt-1"
                      >
                        {showHint2 ? 'Hide Hint 2' : 'Show Hint 2'}
                      </button>
                      {showHint2 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 p-3 mt-1.5 bg-gray-50 dark:bg-gray-800/20 border border-light-border dark:border-dark-border rounded-xl">
                          {problem.hint2}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 h-full">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-xs text-gray-400">
                    Draft notes inside this workspace (supports Markdown text).
                  </span>
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary text-white hover:bg-brand-primary-hover text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {savingNote ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Save Note
                  </button>
                </div>
                {loadingNote ? (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    Loading note text...
                  </div>
                ) : (
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Write down details about the optimal time/space complexity bounds or write your approach details here..."
                    className="flex-1 w-full p-4 border border-gray-200 dark:border-dark-border dark:bg-gray-800/20 rounded-xl text-sm focus:outline-none focus:border-brand-primary dark:text-white font-sans resize-none"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Editor & Console Output */}
        <div className="flex flex-col gap-4 min-h-0 overflow-hidden">
          {/* Monaco Editor Container */}
          <div className="flex-1 border border-light-border dark:border-dark-border rounded-2xl bg-white dark:bg-dark-card overflow-hidden shadow-sm flex flex-col min-h-0">
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={language}
                value={code}
                theme={editorTheme}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  lineNumbers: 'on',
                  bracketPairColorization: { enabled: true },
                  autoClosingBrackets: 'always',
                  autoClosingQuotes: 'always',
                  tabSize: 4
                }}
              />
            </div>

            {/* Run / Submit Actions Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-light-border dark:bg-gray-900/20 dark:border-dark-border flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={handleCompile}
                disabled={compiling || submitting}
                className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {compiling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Compile & Run
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={compiling || submitting}
                className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Submit Code
              </button>
            </div>
          </div>

          {/* Console / Simulated Run Output panel */}
          {(consoleOutput || compiling || submitting) && (
            <div className="h-44 border border-light-border dark:border-dark-border rounded-2xl bg-white dark:bg-dark-card flex flex-col overflow-hidden shadow-sm shrink-0">
              <div className="px-4 py-2 border-b border-light-border bg-gray-50/50 dark:bg-gray-800/20 dark:border-dark-border flex items-center justify-between shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Console Output
                </span>
                {consoleStatus === 'success' && (
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 uppercase tracking-wider">
                    Success
                  </span>
                )}
                {consoleStatus === 'error' && (
                  <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 uppercase tracking-wider">
                    Error
                  </span>
                )}
              </div>
              <div className="flex-1 p-4 font-mono text-xs text-gray-700 dark:text-gray-300 overflow-y-auto whitespace-pre-wrap dark:bg-gray-950/20">
                {compiling && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Compiling code against test cases...
                  </div>
                )}
                {submitting && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting solution and recording statistics...
                  </div>
                )}
                {!compiling && !submitting && consoleOutput}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
