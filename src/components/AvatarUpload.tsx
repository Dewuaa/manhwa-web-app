'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  username?: string | null;
  size?: 'sm' | 'md' | 'lg';
  onUploadComplete?: (url: string) => void;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

const iconSizes = {
  sm: 24,
  md: 36,
  lg: 48,
};

export default function AvatarUpload({
  currentAvatar,
  username,
  size = 'lg',
  onUploadComplete,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, updateProfile } = useAuth();
  const { success, error: showError } = useToast();
  const supabase = getSupabaseClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError('Image must be less than 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Supabase
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    if (!supabase || !user) {
      showError('Please sign in to upload an avatar');
      return;
    }

    setUploading(true);

    try {
      // Create unique filename with user id prefix for RLS
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        // If bucket doesn't exist, show helpful message
        if (
          uploadError.message.includes('bucket') ||
          uploadError.message.includes('not found')
        ) {
          showError(
            'Avatar storage not set up. Please create "avatars" bucket in Supabase.',
          );
          console.error('Storage bucket error:', uploadError);
          setPreview(null);
          return;
        }
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await updateProfile({ avatar_url: publicUrl });

      if (updateError) {
        throw updateError;
      }

      success('Avatar updated successfully!');
      onUploadComplete?.(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      showError('Failed to upload avatar');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const displayAvatar = preview || currentAvatar;
  const initial = username?.[0]?.toUpperCase() || 'U';

  return (
    <div className="relative inline-block">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={`${sizeClasses[size]} rounded-full relative overflow-hidden group cursor-pointer`}
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 animate-pulse opacity-50 blur-md" />

        {/* Avatar container */}
        <div className="relative w-full h-full rounded-full border-4 border-[#0a0a0a] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden">
          {displayAvatar ? (
            <Image
              src={displayAvatar}
              alt={username || 'User avatar'}
              fill
              sizes="128px"
              className="object-cover"
            />
          ) : (
            <span
              className="text-white font-black"
              style={{ fontSize: iconSizes[size] * 0.6 }}
            >
              {initial}
            </span>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </div>
        </div>
      </motion.button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload hint */}
      {!uploading && (
        <div
          className="absolute -bottom-1 -right-1 z-20 bg-blue-600 p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera size={14} className="text-white" />
        </div>
      )}
    </div>
  );
}
