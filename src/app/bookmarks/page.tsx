'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBookmarks, clearBookmarks, Bookmark } from '@/lib/storage';
import { ArrowLeft, Trash2, Heart, BookOpen } from 'lucide-react';
import { Provider } from '@/lib/types';
import ManhwaCard from '@/components/ManhwaCard';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const provider = Provider.MANHUAUS;

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const handleClearBookmarks = () => {
    clearBookmarks();
    setBookmarks([]);
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
                <Heart className="w-5 h-5 mr-2 text-pink-500 fill-pink-500" />
                Bookmarks
              </h1>
              {bookmarks.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Clear Bookmarks"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {bookmarks.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl ring-1 ring-white/10">
            <div className="text-7xl mb-6">💔</div>
            <h3 className="text-2xl font-bold text-white mb-3">No bookmarks yet</h3>
            <p className="text-gray-400 text-lg mb-8">
              Save your favorite manhwa to access them quickly here!
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
            >
              Browse Manhwa
            </Link>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {bookmarks.map((bookmark) => (
              <ManhwaCard
                key={bookmark.id}
                manhwa={{
                  id: bookmark.id,
                  title: bookmark.title,
                  image: bookmark.image,
                  status: 'Unknown',
                  latestChapter: '',
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Clear Bookmarks Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 max-w-sm w-full ring-1 ring-white/10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Clear Bookmarks?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to remove all bookmarks? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearBookmarks}
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
