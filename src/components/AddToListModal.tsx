'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Plus,
  BookOpen,
  Clock,
  CheckCircle,
  PauseCircle,
  XCircle,
  Heart,
  List,
  Sparkles,
} from 'lucide-react';
import { useLists } from '@/contexts/ListsContext';
import { useToast } from '@/contexts/ToastContext';

// Icon mapping
const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; size?: number }>
> = {
  'book-open': BookOpen,
  clock: Clock,
  'check-circle': CheckCircle,
  'pause-circle': PauseCircle,
  'x-circle': XCircle,
  heart: Heart,
  list: List,
  sparkles: Sparkles,
};

// Color mapping
const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const checkColorMap: Record<string, string> = {
  blue: 'bg-blue-500 border-blue-500',
  purple: 'bg-purple-500 border-purple-500',
  green: 'bg-green-500 border-green-500',
  yellow: 'bg-yellow-500 border-yellow-500',
  red: 'bg-red-500 border-red-500',
  pink: 'bg-pink-500 border-pink-500',
  orange: 'bg-orange-500 border-orange-500',
  cyan: 'bg-cyan-500 border-cyan-500',
};

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  manhwa: {
    id: string;
    title: string;
    image?: string;
  };
}

export function AddToListModal({ isOpen, onClose, manhwa }: AddToListModalProps) {
  const { lists, getManhwaLists, setManhwaLists, createList, isLoading } = useLists();
  const { success } = useToast();

  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Memoize sorted lists
  const sortedLists = useMemo(() => {
    return [...lists].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [lists]);

  // Load current lists for this manhwa
  useEffect(() => {
    if (isOpen && manhwa.id) {
      setSelectedLists(getManhwaLists(manhwa.id));
    }
  }, [isOpen, manhwa.id, getManhwaLists]);

  const toggleList = useCallback((listId: string) => {
    setSelectedLists((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId],
    );
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    await setManhwaLists(manhwa.id, manhwa.title, manhwa.image, selectedLists);
    setIsSaving(false);
    success('Lists updated');
    onClose();
  }, [manhwa, selectedLists, setManhwaLists, success, onClose]);

  const handleCreateList = useCallback(async () => {
    if (!newListName.trim()) return;

    const newList = await createList(newListName.trim());
    if (newList) {
      setSelectedLists((prev) => [...prev, newList.id]);
      setNewListName('');
      setShowNewList(false);
      success('List created');
    }
  }, [newListName, createList, success]);

  const getIcon = useCallback((iconName: string) => {
    const Icon = iconMap[iconName] || List;
    return Icon;
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Add to List</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Manhwa Info */}
            <div className="px-4 py-3 border-b border-white/5 bg-white/5">
              <p className="text-white font-medium text-sm truncate">{manhwa.title}</p>
            </div>

            {/* Lists */}
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-1">
                  {sortedLists.map((list) => {
                    const Icon = getIcon(list.icon);
                    const isSelected = selectedLists.includes(list.id);

                    return (
                      <button
                        key={list.id}
                        onClick={() => toggleList(list.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        {/* Icon */}
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorMap[list.color] || colorMap.blue}`}
                        >
                          <Icon size={20} />
                        </div>

                        {/* Name */}
                        <div className="flex-1 text-left">
                          <p className="text-white font-medium text-sm">{list.name}</p>
                          {list.description && (
                            <p className="text-gray-500 text-xs">{list.description}</p>
                          )}
                        </div>

                        {/* Checkbox */}
                        <div
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? checkColorMap[list.color] || checkColorMap.blue
                              : 'border-gray-600'
                          }`}
                        >
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}

                  {/* Create New List */}
                  {showNewList ? (
                    <div className="p-3 bg-white/5 rounded-xl space-y-3">
                      <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="List name..."
                        autoFocus
                        className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateList();
                          if (e.key === 'Escape') setShowNewList(false);
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowNewList(false)}
                          className="flex-1 px-3 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateList}
                          disabled={!newListName.trim()}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewList(true)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-dashed border-gray-600">
                        <Plus size={20} />
                      </div>
                      <span className="text-sm font-medium">Create new list</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={18} />
                    Save
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Quick add button for list selection
 */
interface QuickListButtonProps {
  manhwa: {
    id: string;
    title: string;
    image?: string;
  };
  className?: string;
}

export function QuickListButton({ manhwa, className = '' }: QuickListButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isInAnyList } = useLists();

  const inList = isInAnyList(manhwa.id);

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={`p-2 rounded-full transition-all ${
          inList
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-white/10 text-white hover:bg-white/20'
        } ${className}`}
        title="Add to list"
      >
        <List size={18} />
      </button>

      <AddToListModal isOpen={isOpen} onClose={() => setIsOpen(false)} manhwa={manhwa} />
    </>
  );
}
