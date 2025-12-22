'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ManhwaLink } from './ManhwaLink';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed md:absolute right-0 top-0 md:top-full md:mt-2 w-full md:w-96 max-h-[80vh] md:max-h-[70vh] bg-gray-900 border border-white/10 md:rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/50 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <h2 className="text-white font-bold">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck size={18} />
                    </button>
                    <button
                      onClick={clearAll}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                      title="Clear all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors md:hidden"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400 font-medium mb-1">No notifications yet</p>
                  <p className="text-gray-500 text-sm">
                    We&apos;ll notify you when new chapters are available
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`relative group ${
                        notification.read ? 'bg-transparent' : 'bg-blue-500/5'
                      }`}
                    >
                      <ManhwaLink
                        href={`/manhwa/${encodeURIComponent(notification.manhwaId)}`}
                        onClick={() => {
                          markAsRead(notification.id);
                          onClose();
                        }}
                        className="flex gap-3 p-4 hover:bg-white/5 transition-colors"
                      >
                        {/* Image */}
                        <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 relative">
                          {notification.manhwaImage ? (
                            <Image
                              src={notification.manhwaImage}
                              alt={notification.manhwaTitle}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-gray-600" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">
                            {notification.manhwaTitle}
                          </p>
                          <p className="text-blue-400 text-sm font-medium truncate">
                            New: {notification.chapterTitle}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {formatDistanceToNow(notification.timestamp, {
                              addSuffix: true,
                            })}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        )}

                        <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-2" />
                      </ManhwaLink>

                      {/* Delete button on hover */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeNotification(notification.id);
                        }}
                        className="absolute right-2 top-2 p-1.5 bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-gray-900/50">
              <Link
                href="/profile#notifications"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
              >
                <Settings size={16} />
                Notification Settings
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
