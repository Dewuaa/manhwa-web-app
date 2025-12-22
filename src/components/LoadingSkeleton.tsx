import { cn } from '@/lib/utils';

// Base skeleton with shimmer effect
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn('rounded-md skeleton-shimmer', className)} 
      {...props} 
    />
  );
}

// Avatar skeleton (circular)
export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  return <Skeleton className={cn(sizes[size], 'rounded-full')} />;
}

// Text line skeleton
export function TextSkeleton({ width = 'full' }: { width?: 'full' | '3/4' | '1/2' | '1/4' }) {
  const widths = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/4': 'w-1/4',
  };
  return <Skeleton className={cn('h-4', widths[width])} />;
}

// Manhwa card skeleton with shimmer
export function ManhwaCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4.5] w-full rounded-2xl" />
      <div className="space-y-2 px-1">
        <Skeleton className="h-4 w-3/4 rounded-lg" />
        <Skeleton className="h-3 w-1/2 rounded-lg" />
      </div>
    </div>
  );
}

// Grid of manga cards skeleton
export function ManhwaGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ManhwaCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Horizontal row skeleton (for category rows)
export function CategoryRowSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded-lg" />
      </div>
      {/* Cards */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-32 md:w-40 space-y-2">
            <Skeleton className="aspect-[3/4.5] w-full rounded-xl" />
            <Skeleton className="h-3 w-3/4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Comment skeleton
export function CommentSkeleton() {
  return (
    <div className="flex gap-3 p-4 bg-white/5 rounded-xl">
      <AvatarSkeleton />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}

// Post skeleton
export function PostSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AvatarSkeleton />
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>
      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
      </div>
      {/* Actions */}
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-5 w-12 rounded" />
        <Skeleton className="h-5 w-12 rounded" />
      </div>
    </div>
  );
}

// Feed skeleton (for community page)
export function FeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

// Detail page skeleton
export function DetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="max-w-3xl space-y-6">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-12 md:h-20 w-3/4 rounded-2xl" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-32 rounded-lg" />
              <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-14 w-40 rounded-xl" />
              <Skeleton className="h-14 w-40 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-[1600px] mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-8">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// Hero carousel skeleton
export function HeroSkeleton() {
  return (
    <div className="relative h-[60vh] md:h-[70vh]">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 space-y-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-12 w-2/3 rounded-xl" />
        <Skeleton className="h-4 w-1/2 rounded" />
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-12 w-36 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Export base Skeleton for custom use
export { Skeleton };
