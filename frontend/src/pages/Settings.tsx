import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import api from '../services/api';
import { Sun, Moon, Languages, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { refreshUser } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  
  const [preferredLanguage, setPreferredLanguage] = useState('Java');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load preferences from database
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        const settings = response.data.settings;
        if (settings) {
          setPreferredLanguage(settings.preferredLanguage || 'Java');
        }
      } catch (err) {
        console.error('Failed to load settings from DB', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      await api.put('/settings', {
        darkMode,
        preferredLanguage
      });
      setSuccess(true);
      refreshUser();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white m-0 tracking-tight leading-none">
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Customize your study preferences and editor options
        </p>
      </div>

      <div className="bg-white border border-light-border dark:bg-dark-card dark:border-dark-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          {success && (
            <div className="flex items-center gap-2 p-3 text-sm rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Preferences saved successfully!</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm rounded-xl border border-red-500/10 bg-red-500/5 text-red-500 dark:bg-red-500/10">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Theme setting */}
          <div className="flex items-center justify-between pb-6 border-b border-light-border dark:border-dark-border">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-2">
                {darkMode ? <Moon className="w-4 h-4 text-brand-primary" /> : <Sun className="w-4 h-4 text-amber-500" />}
                Interface Theme
              </h3>
              <p className="text-xs text-gray-400">
                Choose between dark and light appearance for this workspace.
              </p>
            </div>
            
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                darkMode
                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                  : 'border-gray-200 hover:bg-gray-100'
              }`}
            >
              {darkMode ? 'Dark Mode Active' : 'Light Mode Active'}
            </button>
          </div>

          {/* Language setting */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-light-border dark:border-dark-border">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-2">
                <Languages className="w-4 h-4 text-brand-secondary" />
                Preferred Programming Language
              </h3>
              <p className="text-xs text-gray-400">
                This language will be selected by default when loading new coding problems.
              </p>
            </div>

            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-200 bg-white dark:border-dark-border dark:bg-gray-800 dark:text-white rounded-xl text-xs font-bold focus:outline-none"
            >
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-brand-primary/10 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
