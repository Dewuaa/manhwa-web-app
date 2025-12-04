'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getReadingHistory, clearHistory, ReadingHistory } from '@/lib/storage';
import { ArrowLeft, Trash2, History, BookOpen, Calendar } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setHistory(getReadingHistory());
  }, []);

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="hidden md:inline-flex items-center text-gray-400 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white flex items-center">
                <History className="w-5 h-5 mr-2 text-blue-500" />
                Reading History
              </h1>
              {history.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Clear History"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {history.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl ring-1 ring-white/10">
            <div className="text-7xl mb-6">📜</div>
            <h3 className="text-2xl font-bold text-white mb-3">No history yet</h3>
            <p className="text-gray-400 text-lg mb-8">
              Start reading some manhwa to see them here!
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              Browse Manhwa
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <Link
                key={item.manhwaId}
                href={`/manhwa/${encodeURIComponent(item.manhwaId)}/read/${encodeURIComponent(item.chapterId)}`}
                className="group bg-white/5 rounded-xl overflow-hidden ring-1 ring-white/10 hover:bg-white/10 transition-all hover:-translate-y-1 hover:ring-blue-500/30 flex"
              >
                <div className="w-24 bg-black/20 flex-shrink-0 relative">
                  <Image
                    src={item.manhwaImage}
                    alt={item.manhwaTitle}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="p-4 flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-white font-bold text-base line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                    {item.manhwaTitle}
                  </h3>
                  <div className="flex items-center text-blue-400 text-sm font-semibold mb-2">
                    <BookOpen className="w-4 h-4 mr-1.5" />
                    <span className="truncate">{item.chapterTitle}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-xs">
                    <Calendar className="w-3 h-3 mr-1.5" />
                    {new Date(item.lastReadAt).toLocaleString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Clear History Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 max-w-sm w-full ring-1 ring-white/10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Clear History?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to clear your entire reading history? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
