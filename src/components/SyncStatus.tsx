'use client';

import {
  Cloud,
  CloudOff,
  RefreshCw,
  Check,
  AlertCircle,
  Heart,
  BookOpen,
} from 'lucide-react';
import { useCloudSync } from '@/hooks/useCloudSync';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface SyncStatusProps {
  compact?: boolean;
  showLabel?: boolean;
}

export function SyncStatus({ compact = false, showLabel = true }: SyncStatusProps) {
  const { isSyncing, lastSyncTime, error, isEnabled, forceSync } = useCloudSync();

  if (!isEnabled) {
    if (compact) return null;

    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <CloudOff size={16} />
        {showLabel && <span>Sign in to sync</span>}
      </div>
    );
  }

  const handleSync = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await forceSync();
  };

  const getStatusContent = () => {
    if (isSyncing) {
      return {
        icon: (
          <RefreshCw size={compact ? 14 : 16} className="animate-spin text-blue-400" />
        ),
        text: 'Syncing...',
        color: 'text-blue-400',
      };
    }

    if (error) {
      return {
        icon: <AlertCircle size={compact ? 14 : 16} className="text-red-400" />,
        text: 'Sync error',
        color: 'text-red-400',
      };
    }

    return {
      icon: <Cloud size={compact ? 14 : 16} className="text-green-400" />,
      text: lastSyncTime
        ? `Synced ${formatDistanceToNow(lastSyncTime, { addSuffix: true })}`
        : 'Synced',
      color: 'text-green-400',
    };
  };

  const status = getStatusContent();

  if (compact) {
    return (
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors ${status.color}`}
        title={error || status.text}
      >
        {status.icon}
      </button>
    );
  }

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors ${status.color}`}
      title={error ? `Error: ${error}. Click to retry.` : 'Click to sync now'}
    >
      {status.icon}
      {showLabel && <span className="text-sm">{status.text}</span>}
    </button>
  );
}

/**
 * Full sync panel for profile/settings page
 */
export function SyncPanel() {
  const {
    isSyncing,
    lastSyncTime,
    error,
    isEnabled,
    forceSync,
    syncBookmarksOnly,
    syncProgressOnly,
  } = useCloudSync();

  if (!isEnabled) {
    return (
      <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
            <CloudOff className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Cloud Sync</h3>
            <p className="text-sm text-gray-400">Sign in to enable cloud sync</p>
          </div>
        </div>
        <p className="text-gray-500 text-sm">
          Your bookmarks and reading progress are saved locally. Sign in to sync across
          devices and never lose your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              error ? 'bg-red-500/20' : 'bg-green-500/20'
            }`}
          >
            {isSyncing ? (
              <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
            ) : error ? (
              <AlertCircle className="w-5 h-5 text-red-400" />
            ) : (
              <Cloud className="w-5 h-5 text-green-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">Cloud Sync</h3>
            <p className="text-sm text-gray-400">
              {isSyncing
                ? 'Syncing your data...'
                : lastSyncTime
                  ? `Last synced ${formatDistanceToNow(lastSyncTime, { addSuffix: true })}`
                  : 'Not synced yet'}
            </p>
          </div>
        </div>

        <button
          onClick={() => forceSync()}
          disabled={isSyncing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          Sync Now
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-pink-400" />
            </div>
            <span className="text-gray-300">Bookmarks</span>
          </div>
          <button
            onClick={() => syncBookmarksOnly()}
            disabled={isSyncing}
            className="text-sm text-blue-400 hover:text-blue-300 disabled:text-gray-600"
          >
            Sync
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-gray-300">Reading Progress</span>
          </div>
          <button
            onClick={() => syncProgressOnly()}
            disabled={isSyncing}
            className="text-sm text-blue-400 hover:text-blue-300 disabled:text-gray-600"
          >
            Sync
          </button>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5">
        <p className="text-xs text-gray-500 flex items-center gap-2">
          <Check size={12} className="text-green-500" />
          Your data is automatically synced when you make changes
        </p>
      </div>
    </div>
  );
}
