'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Copy,
  Twitter,
  MessageCircle,
  Check,
  X,
  Link as LinkIcon,
} from 'lucide-react';
import {
  shareProgress,
  generateShareableProgress,
  generateShareUrl,
  generateShareText,
  ShareableProgress,
} from '@/lib/socialService';
import { useToast } from '@/contexts/ToastContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  manhwaId: string;
  manhwaTitle: string;
}

export function ShareModal({ isOpen, onClose, manhwaId, manhwaTitle }: ShareModalProps) {
  const [progress, setProgress] = useState<ShareableProgress | null>(null);
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    if (isOpen && manhwaId) {
      const p = generateShareableProgress(manhwaId);
      setProgress(p);
    }
  }, [isOpen, manhwaId]);

  const handleNativeShare = async () => {
    const shared = await shareProgress(manhwaId);
    if (shared) {
      success('Shared successfully!');
      onClose();
    }
  };

  const handleCopyLink = async () => {
    const url = generateShareUrl(manhwaId);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyText = async () => {
    if (!progress) return;
    const text = generateShareText(progress);
    const url = generateShareUrl(manhwaId);
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleTwitterShare = () => {
    if (!progress) return;
    const text = encodeURIComponent(generateShareText(progress));
    const url = encodeURIComponent(generateShareUrl(manhwaId));
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    if (!progress) return;
    const text = encodeURIComponent(
      `${generateShareText(progress)}\n${generateShareUrl(manhwaId)}`,
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

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
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">Share</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Preview */}
              <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                <p className="text-white font-medium mb-1">{manhwaTitle}</p>
                {progress && (
                  <p className="text-gray-400 text-sm">
                    {progress.totalChapters
                      ? `${progress.chaptersRead}/${progress.totalChapters} chapters (${progress.progressPercent}%)`
                      : `${progress.chaptersRead} chapters read`}
                  </p>
                )}
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Native Share (if available) */}
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors col-span-2"
                  >
                    <Share2 size={18} />
                    Share
                  </button>
                )}

                {/* Twitter */}
                <button
                  onClick={handleTwitterShare}
                  className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
                >
                  <Twitter size={18} className="text-[#1DA1F2]" />
                  Twitter
                </button>

                {/* WhatsApp */}
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
                >
                  <MessageCircle size={18} className="text-[#25D366]" />
                  WhatsApp
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
                >
                  {copied ? (
                    <Check size={18} className="text-green-400" />
                  ) : (
                    <LinkIcon size={18} />
                  )}
                  Copy Link
                </button>

                {/* Copy Text */}
                <button
                  onClick={handleCopyText}
                  className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
                >
                  <Copy size={18} />
                  Copy Text
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Quick share button for inline use
 */
interface ShareButtonProps {
  manhwaId: string;
  manhwaTitle: string;
  variant?: 'icon' | 'text' | 'full';
  className?: string;
}

export function ShareButton({
  manhwaId,
  manhwaTitle,
  variant = 'icon',
  className = '',
}: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors ${className}`}
        >
          <Share2 size={20} />
        </button>
        <ShareModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          manhwaId={manhwaId}
          manhwaTitle={manhwaTitle}
        />
      </>
    );
  }

  if (variant === 'text') {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 text-gray-400 hover:text-white transition-colors ${className}`}
        >
          <Share2 size={16} />
          Share
        </button>
        <ShareModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          manhwaId={manhwaId}
          manhwaTitle={manhwaTitle}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10 ${className}`}
      >
        <Share2 size={18} />
        Share Progress
      </button>
      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        manhwaId={manhwaId}
        manhwaTitle={manhwaTitle}
      />
    </>
  );
}
