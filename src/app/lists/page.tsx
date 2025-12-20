'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  BookOpen,
  Clock,
  CheckCircle,
  PauseCircle,
  XCircle,
  Heart,
  List,
  Sparkles,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { useLists } from '@/contexts/ListsContext';
import { useToast } from '@/contexts/ToastContext';
import ImageWithFallback from '@/components/ImageWithFallback';

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

// Color mapping for backgrounds
const bgColorMap: Record<string, string> = {
  blue: 'from-blue-600/20 to-blue-600/5',
  purple: 'from-purple-600/20 to-purple-600/5',
  green: 'from-green-600/20 to-green-600/5',
  yellow: 'from-yellow-600/20 to-yellow-600/5',
  red: 'from-red-600/20 to-red-600/5',
  pink: 'from-pink-600/20 to-pink-600/5',
  orange: 'from-orange-600/20 to-orange-600/5',
  cyan: 'from-cyan-600/20 to-cyan-600/5',
};

const iconColorMap: Record<string, string> = {
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400',
  pink: 'text-pink-400',
  orange: 'text-orange-400',
  cyan: 'text-cyan-400',
};

const AVAILABLE_COLORS = [
  'blue',
  'purple',
  'green',
  'yellow',
  'red',
  'pink',
  'orange',
  'cyan',
];
const AVAILABLE_ICONS = [
  'list',
  'book-open',
  'clock',
  'check-circle',
  'pause-circle',
  'x-circle',
  'heart',
  'sparkles',
];

export default function ListsPage() {
  const { lists, getListItems, createList, editList, removeList, isLoading } = useLists();
  const { success, error } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('list');
  const [formColor, setFormColor] = useState('blue');

  // Memoize sorted lists
  const sortedLists = useMemo(() => {
    return [...lists].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [lists]);

  const getIcon = useCallback((iconName: string) => {
    return iconMap[iconName] || List;
  }, []);

  const handleCreateList = useCallback(async () => {
    if (!formName.trim()) {
      error('Please enter a list name');
      return;
    }

    const newList = await createList(
      formName.trim(),
      formDescription.trim(),
      formIcon,
      formColor,
    );
    if (newList) {
      success('List created');
      resetForm();
      setShowCreateModal(false);
    } else {
      error('A list with this name already exists');
    }
  }, [formName, formDescription, formIcon, formColor, createList, success, error]);

  const handleEditList = useCallback(async () => {
    if (!editingList || !formName.trim()) return;

    await editList(editingList, {
      name: formName.trim(),
      description: formDescription.trim(),
      icon: formIcon,
      color: formColor,
    });

    success('List updated');
    resetForm();
    setEditingList(null);
  }, [editingList, formName, formDescription, formIcon, formColor, editList, success]);

  const handleDeleteList = useCallback(
    async (listId: string) => {
      await removeList(listId);
      success('List deleted');
      setMenuOpen(null);
    },
    [removeList, success],
  );

  const openEditModal = useCallback((list: (typeof lists)[0]) => {
    setFormName(list.name);
    setFormDescription(list.description || '');
    setFormIcon(list.icon);
    setFormColor(list.color);
    setEditingList(list.id);
    setMenuOpen(null);
  }, []);

  const resetForm = useCallback(() => {
    setFormName('');
    setFormDescription('');
    setFormIcon('list');
    setFormColor('blue');
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <List className="w-6 h-6 text-blue-500" />
              My Lists
            </h1>

            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus size={18} />
              New List
            </button>
          </div>
        </div>
      </div>

      {/* Lists Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedLists.map((list) => {
            const Icon = getIcon(list.icon);
            const items = getListItems(list.id);
            const previewItems = items.slice(0, 4);

            return (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
              >
                <Link href={`/lists/${list.id}`}>
                  <div
                    className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${bgColorMap[list.color]} hover:border-white/20 transition-all cursor-pointer`}
                  >
                    {/* Preview Images */}
                    <div className="h-32 relative">
                      {previewItems.length > 0 ? (
                        <div className="absolute inset-0 grid grid-cols-4 gap-0.5 opacity-60">
                          {previewItems.map((item, i) => (
                            <div key={item.id} className="relative h-full">
                              {item.image ? (
                                <ImageWithFallback
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-800" />
                              )}
                            </div>
                          ))}
                          {[...Array(4 - previewItems.length)].map((_, i) => (
                            <div key={`empty-${i}`} className="bg-gray-800/50" />
                          ))}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon
                            size={48}
                            className={`${iconColorMap[list.color]} opacity-30`}
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 ${iconColorMap[list.color]}`}
                        >
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white truncate">{list.name}</h3>
                          <p className="text-sm text-gray-400">{items.length} items</p>
                        </div>
                        <ChevronRight
                          size={20}
                          className="text-gray-500 group-hover:text-white transition-colors"
                        />
                      </div>

                      {list.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {list.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Menu Button (only for non-default lists) */}
                {!list.isDefault && (
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpen(menuOpen === list.id ? null : list.id);
                      }}
                      className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <MoreVertical size={16} />
                    </button>

                    <AnimatePresence>
                      {menuOpen === list.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute top-full right-0 mt-1 w-36 bg-gray-800 border border-white/10 rounded-xl overflow-hidden shadow-xl"
                        >
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              openEditModal(list);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteList(list.id);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {lists.length === 0 && (
          <div className="text-center py-16">
            <List className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No lists yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first list to organize your reading
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Create List
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingList) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCreateModal(false);
                setEditingList(null);
                resetForm();
              }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">
                  {editingList ? 'Edit List' : 'Create New List'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingList(null);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div className="p-4 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="My List"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="What's this list for?"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_ICONS.map((iconName) => {
                      const Icon = getIcon(iconName);
                      return (
                        <button
                          key={iconName}
                          onClick={() => setFormIcon(iconName)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            formIcon === iconName
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          <Icon size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormColor(color)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          formColor === color
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900'
                            : ''
                        }`}
                        style={{
                          backgroundColor: `var(--color-${color}-500, ${
                            color === 'blue'
                              ? '#3b82f6'
                              : color === 'purple'
                                ? '#a855f7'
                                : color === 'green'
                                  ? '#22c55e'
                                  : color === 'yellow'
                                    ? '#eab308'
                                    : color === 'red'
                                      ? '#ef4444'
                                      : color === 'pink'
                                        ? '#ec4899'
                                        : color === 'orange'
                                          ? '#f97316'
                                          : '#06b6d4'
                          })`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-white/5 flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingList(null);
                    resetForm();
                  }}
                  className="flex-1 py-3 text-gray-400 hover:text-white font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingList ? handleEditList : handleCreateList}
                  disabled={!formName.trim()}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-colors"
                >
                  {editingList ? 'Save Changes' : 'Create List'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
}
