import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  actionText?: string;
  actionLink?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  icon, 
  actionText = "See All",
  actionLink
}) => {
  const ButtonContent = () => (
    <div className="flex items-center gap-1 text-xs text-gray-500 font-bold hover:text-white transition-colors">
      {actionText} <ChevronRight size={14} />
    </div>
  );

  return (
    <div className="flex justify-between items-center mb-4 px-4">
        <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        </div>
        {actionLink ? (
          <Link href={actionLink}>
            <ButtonContent />
          </Link>
        ) : (
          <button>
            <ButtonContent />
          </button>
        )}
    </div>
  );
};
