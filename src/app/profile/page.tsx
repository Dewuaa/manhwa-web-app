'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Bell,
  Moon,
  ChevronRight,
  Shield,
  BookOpen,
  Heart,
  Trash2,
  Download,
  HelpCircle,
  BookMarked,
  History,
  Eye,
  LogOut,
  LogIn,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { getBookmarks, clearHistory as clearStorageHistory } from '@/lib/storage';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { SyncPanel } from '@/components/SyncStatus';
import AvatarUpload from '@/components/AvatarUpload';
import AuthModal from '@/components/AuthModal';
import { BadgesDisplay } from '@/components/StatsDisplay';

// Reading stats from history
interface ReadingStats {
  totalChaptersRead: number;
  totalManhwaRead: number;
  totalBookmarks: number;
  readingStreak: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { success } = useToast();
  const { history, clearHistory } = useReadingHistory();
  const { user, profile, signOut, isConfigured } = useAuth();

  // Settings state
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [autoPreload, setAutoPreload] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Stats
  const [stats, setStats] = useState<ReadingStats>({
    totalChaptersRead: 0,
    totalManhwaRead: 0,
    totalBookmarks: 0,
    readingStreak: 0,
  });

  // Load settings on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('app_dark_mode');
    const savedNotifications = localStorage.getItem('app_notifications');
    const savedAutoPreload = localStorage.getItem('reader_auto_preload');

    if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true');
    if (savedNotifications !== null) setNotifications(savedNotifications === 'true');
    if (savedAutoPreload !== null) setAutoPreload(savedAutoPreload === 'true');
  }, []);

  // Calculate reading stats when history changes
  useEffect(() => {
    const bookmarks = getBookmarks();
    const uniqueManhwa = new Set(history.map((h) => h.manhwaId));
    const completedChapters = history.reduce(
      (acc, h) => acc + (h.chaptersRead?.length || 0),
      0,
    );

    // Calculate streak (simplified - days with reading activity)
    const today = new Date();
    let streak = 0;
    const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

    if (sortedHistory.length > 0) {
      const lastRead = new Date(sortedHistory[0].timestamp);
      const daysDiff = Math.floor(
        (today.getTime() - lastRead.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysDiff <= 1) {
        streak = Math.min(history.length, 7); // Cap at 7 for display
      }
    }

    setStats({
      totalChaptersRead: completedChapters,
      totalManhwaRead: uniqueManhwa.size,
      totalBookmarks: bookmarks.length,
      readingStreak: streak,
    });
  }, [history]);

  const updateSetting = (key: string, value: boolean) => {
    localStorage.setItem(key, String(value));
  };

  const handleDarkModeToggle = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    updateSetting('app_dark_mode', newValue);
  };

  const handleNotificationsToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    updateSetting('app_notifications', newValue);
  };

  const handleAutoPreloadToggle = () => {
    const newValue = !autoPreload;
    setAutoPreload(newValue);
    updateSetting('reader_auto_preload', newValue);
  };

  const handleClearHistory = () => {
    clearHistory();
    clearStorageHistory();
    setShowClearModal(false);
    success('Reading history cleared');
  };

  const handleExportData = () => {
    const data = {
      readingHistory: history,
      bookmarks: getBookmarks(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inkora-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Data exported successfully');
  };

  // Calculate level based on chapters read
  const level = profile?.level || Math.floor(stats.totalChaptersRead / 10) + 1;
  const chaptersToNextLevel = 10 - (stats.totalChaptersRead % 10);
  const displayName = profile?.username || 'Reader';

  const handleSignOut = async () => {
    await signOut();
    success('Signed out successfully');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 overflow-x-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 inset-x-0 h-64 bg-linear-to-b from-blue-900/20 to-transparent pointer-events-none" />

      <div className="max-w-2xl mx-auto p-4 md:p-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">Profile</h1>
          <button
            onClick={() => router.push('/settings')}
            className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex flex-col items-center mb-8">
          {user && isConfigured ? (
            <>
              <AvatarUpload
                currentAvatar={profile?.avatar_url}
                username={displayName}
                size="lg"
              />
              <h2 className="text-2xl font-black text-white tracking-tight mb-1 mt-4">
                {displayName}
              </h2>
              <span className="text-pink-400 text-xs font-bold bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                Level {level} Reader
              </span>
              <p className="text-gray-500 text-xs mt-2">
                {chaptersToNextLevel} chapters to Level {level + 1}
              </p>
              <button
                onClick={handleSignOut}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="relative w-28 h-28 mb-4">
                <div className="absolute inset-0 bg-linear-to-tr from-blue-500 to-purple-500 rounded-full animate-pulse opacity-50 blur-md" />
                <div className="w-full h-full rounded-full border-4 border-[#0a0a0a] relative z-10 bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-4xl font-black text-white">R</span>
                </div>
                <div className="absolute bottom-1 right-1 z-20 bg-gray-900 border border-white/10 p-1.5 rounded-full">
                  <Shield size={16} className="text-amber-400 fill-amber-400" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mb-1">
                Reader
              </h2>
              <span className="text-blue-400 text-xs font-bold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                Level {level} Reader
              </span>
              <p className="text-gray-500 text-xs mt-2">
                {chaptersToNextLevel} chapters to Level {level + 1}
              </p>
              {isConfigured && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <LogIn size={16} />
                  Sign In to Sync
                </button>
              )}
            </>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <BookOpen size={20} />
            </div>
            <div className="text-center">
              <div className="text-white font-black text-lg">
                {stats.totalChaptersRead}
              </div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                Chapters
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
              <Heart size={20} />
            </div>
            <div className="text-center">
              <div className="text-white font-black text-lg">{stats.totalBookmarks}</div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                Bookmarks
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Eye size={20} />
            </div>
            <div className="text-center">
              <div className="text-white font-black text-lg">{stats.totalManhwaRead}</div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                Series
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievements Section */}
        <div className="mb-8">
          <BadgesDisplay />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/bookmarks')}
            className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/8 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
              <BookMarked size={20} />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold text-sm">Bookmarks</div>
              <div className="text-gray-500 text-xs">{stats.totalBookmarks} saved</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/history')}
            className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/8 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <History size={20} />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold text-sm">History</div>
              <div className="text-gray-500 text-xs">{history.length} entries</div>
            </div>
          </motion.button>
        </div>

        {/* Settings Menu */}
        <div className="space-y-4">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest ml-1">
            Reader Settings
          </h3>
          <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
            <MenuItem
              icon={Moon}
              label="Dark Mode"
              hasToggle
              checked={darkMode}
              onToggle={handleDarkModeToggle}
            />
            <div className="h-px bg-white/5 mx-4" />
            <MenuItem
              icon={Download}
              label="Auto-preload Chapters"
              hasToggle
              checked={autoPreload}
              onToggle={handleAutoPreloadToggle}
            />
            <div className="h-px bg-white/5 mx-4" />
            <MenuItem
              icon={Bell}
              label="Notifications"
              hasToggle
              checked={notifications}
              onToggle={handleNotificationsToggle}
            />
          </div>

          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest ml-1 mt-6">
            Data
          </h3>
          <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
            <MenuItem icon={Download} label="Export Data" onClick={handleExportData} />
            <div className="h-px bg-white/5 mx-4" />
            <button
              onClick={() => setShowClearModal(true)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-colors text-red-400"
            >
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 size={16} />
              </div>
              <span className="flex-1 font-medium text-sm">Clear History</span>
            </button>
          </div>

          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest ml-1 mt-6">
            Cloud Sync
          </h3>
          <SyncPanel />

          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest ml-1 mt-6">
            Support
          </h3>
          <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
            <MenuItem
              icon={HelpCircle}
              label="Help & Support"
              onClick={() => router.push('/terms')}
            />
            <div className="h-px bg-white/5 mx-4" />
            <MenuItem
              icon={Shield}
              label="Privacy Policy"
              onClick={() => router.push('/privacy')}
            />
          </div>

          {/* App Info */}
          <div className="text-center pt-8 pb-4">
            <p className="text-gray-600 text-xs">Inkora Reader v1.0.0</p>
            <p className="text-gray-700 text-xs mt-1">Made with ❤️ for manga fans</p>
          </div>
        </div>
      </div>

      {/* Clear History Modal */}
      <AnimatePresence>
        {showClearModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-gray-900 border border-white/10 rounded-2xl p-6 z-50"
            >
              <h3 className="text-xl font-bold text-white mb-2">Clear History?</h3>
              <p className="text-gray-400 text-sm mb-6">
                This will permanently delete your reading history. Your bookmarks will be
                preserved.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 py-3 bg-white/5 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearHistory}
                  className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-500 transition-colors"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  value?: string;
  hasToggle?: boolean;
  checked?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
}

const MenuItem = ({
  icon: Icon,
  label,
  value,
  hasToggle,
  checked,
  onToggle,
  onClick,
}: MenuItemProps) => (
  <div
    onClick={hasToggle ? onToggle : onClick}
    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer group"
  >
    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
      <Icon size={16} />
    </div>
    <div className="flex-1 font-medium text-sm text-gray-200 group-hover:text-white transition-colors">
      {label}
    </div>

    {value && (
      <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
        {value}
      </span>
    )}

    {hasToggle && (
      <div
        className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-700'}`}
      >
        <div
          className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${checked ? 'left-6' : 'left-1'}`}
        />
      </div>
    )}

    {!hasToggle && !value && <ChevronRight size={16} className="text-gray-600" />}
  </div>
);
