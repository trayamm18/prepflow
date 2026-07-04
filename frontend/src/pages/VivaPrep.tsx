import React, { useState } from 'react';
import { Search, Flame, Brain, Code2, ChevronDown, ChevronUp } from 'lucide-react';

interface VivaQuestion {
  q: string;
  a: string;
}

export const VivaPrep: React.FC = () => {
  const [search, setSearch] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const vivaQuestions: VivaQuestion[] = [
    {
      q: "Q1: What is the main objective of the VibeCode / PrepFlow project?",
      a: "The objective of PrepFlow is to provide a unified, responsive SaaS web application for technical interview preparation. It consolidates learning dashboards, progress telemetry, timed MCQ mock exams, and an interactive coding sandbox, enabling candidates to systematically track performance and address technical weaknesses."
    },
    {
      q: "Q2: Why did you migrate the desktop JavaFX application structure to a full-stack web app?",
      a: "Web applications provide universal accessibility, cross-platform compatibility, and eliminate local installation requirements. Migrating to React, Node.js, and PostgreSQL allows multi-user sync, cloud database persistence, secure JWT session management, and centralized analytics dashboards."
    },
    {
      q: "Q3: Explain how the Model-View-Controller (MVC) or Client-Server design pattern is implemented here.",
      a: "We use a Client-Server Architecture. The Client (React SPA Frontend) handles the View and user interaction. The Server (Node.js/Express API Gateway) acts as the Controller handling business logic and request validation. The Model (Prisma ORM schema mapped to Neon PostgreSQL) defines database tables and relationships."
    },
    {
      q: "Q4: How is session authentication and security managed between different routes?",
      a: "We use JWT (JSON Web Tokens). Upon login, the backend issues an Access Token (stored in memory/local storage) to authenticate requests via HTTP Headers, and an HttpOnly Refresh Token (stored in secure cookies) to handle automatic token refresh without blocking the user session. All DB inputs are parameterized via Prisma to prevent SQL injection."
    },
    {
      q: "Q5: How does the application switch between Light and Dark themes?",
      a: "Theme state is managed globally using a React ThemeContext. When toggled, the context adds or removes the 'dark' CSS class from the HTML document element and saves the selection in localStorage so preference persists on page reloads."
    },
    {
      q: "Q6: Explain how the countdown timer works during MCQ mock exams.",
      a: "The timer utilizes React state combined with a standard window.setInterval hook. It decrements the time remaining counter once every second. If the timer reaches 0, the current question is auto-submitted as incorrect, preventing candidates from navigating away to search for answers."
    },
    {
      q: "Q7: Explain the compiler validation mechanism in the coding workspace.",
      a: "The workspace uses the Monaco Editor interface. In V1, code compilation is programmatically simulated on the backend. When submitted, the code and selected language are sent to the API, validated for template syntax, run against test cases, and the problem status is updated in the database."
    },
    {
      q: "Q8: How does the system calculate the Practice Streak?",
      a: "When a user submits a coding problem or quiz, the backend queries the database for the user's last activity date. It calculates the difference in days between today and the last active date. If it is exactly 1 day, the streak increments by 1. If it is greater than 1 day, the streak resets to 1. If it is 0 (already practiced today), the streak is maintained without double increments."
    },
    {
      q: "Q9: How is the Adaptive Weakness Quiz Generator implemented?",
      a: "The system analyzes the user's past quiz attempts. It groups past scores by category and calculates the average score for each topic. The category with the lowest average is identified as the user's weakness. When they click 'Auto-Target Weakness', the mock settings pre-configure themselves to load questions from that category."
    },
    {
      q: "Q10: What are the main relational tables in your PostgreSQL database?",
      a: "The primary tables are User (streaks, points), UserSettings (language, dark mode), RefreshToken (session security), Problem (coding challenges), Topic and Company (relations), ProblemProgress (tracking solved challenges), Submission (code logs), Note (problem-specific markdown notes), and MockAttempt (MCQ logs)."
    },
    {
      q: "Q11: Explain the syntax validation fallback system.",
      a: "If compile run servers are offline, the system utilizes a bracket-matching syntax scanner. It counts open and close braces {}, brackets [], and parentheses () in the code block. If the count matches zero at the end of the text, it passes local syntax validation, otherwise it highlights the syntax error."
    },
    {
      q: "Q12: How are progress metrics and activity heatmaps calculated?",
      a: "The database logs every solved problem in the ProblemProgress table with a timestamp. The frontend queries the list of dates the user solved problems, groups them by day, and renders a 53-week CSS grid heatmap where shade intensity represents coding activity density."
    },
    {
      q: "Q13: How does your database prevent duplicate data entries?",
      a: "We apply unique constraint indexes (e.g., @@unique([userId, problemId]) in the database schema) to models like ProblemProgress and Note. This guarantees that each user can have only one progress log or note per coding challenge, preventing data duplication."
    },
    {
      q: "Q14: If you had more time, how would you expand this project?",
      a: "I would integrate isolated sandboxed code execution runners using Docker containers or APIs like Judge0, enabling true multi-language compilation. I would also add real-time multiplayer coding contests using WebSockets."
    }
  ];

  const filteredQuestions = vivaQuestions.filter(
    item =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white tracking-tight">
          Viva Prep & Basic Questions
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review the core logical systems, algorithms, and anticipated viva presentation questions for your project.
        </p>
      </div>

      {/* Logical Systems Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-light-border dark:bg-dark-card dark:border-dark-border rounded-xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-brand-primary font-bold text-sm">
            <Code2 className="w-5 h-5" />
            <span>In-App Compiler</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Extracts user code, cleans public class tags, writes to a temp file, runs standard JDK <code>JavaCompiler</code>, and falls back to character brace-balancing on syntax errors.
          </p>
        </div>

        <div className="p-5 bg-white border border-light-border dark:bg-dark-card dark:border-dark-border rounded-xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-brand-secondary font-bold text-sm">
            <Flame className="w-5 h-5" />
            <span>Streak Algorithm</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Calculates <code>ChronoUnit.DAYS</code> between today and the user's last practice date. Increments if 1 day, resets if &gt;1 day, and preserves if 0 days.
          </p>
        </div>

        <div className="p-5 bg-white border border-light-border dark:bg-dark-card dark:border-dark-border rounded-xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
            <Brain className="w-5 h-5" />
            <span>Adaptive Focus</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Groups past mock score histories, calculates the average score for each category, extracts the lowest average, and auto-selects that topic to target weakness.
          </p>
        </div>
      </div>

      {/* Search Q&A Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Anticipated Viva Q&A
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-9 pr-4 py-1.5 border border-gray-200 bg-gray-50 text-xs rounded-lg focus:outline-none focus:border-brand-primary dark:border-dark-border dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="bg-white border border-light-border dark:bg-dark-card dark:border-dark-border rounded-xl shadow-sm divide-y divide-light-border dark:divide-dark-border overflow-hidden">
          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No matching questions found.
            </div>
          ) : (
            filteredQuestions.map((item, idx) => {
              const isOpen = expandedIndex === idx;
              return (
                <div key={idx} className="transition-all">
                  <button
                    onClick={() => setExpandedIndex(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/10 focus:outline-none"
                  >
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200 pr-4">
                      {item.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-gray-50/50 border-t border-light-border dark:bg-gray-800/10 dark:border-dark-border text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
