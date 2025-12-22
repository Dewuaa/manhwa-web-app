'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function EmailVerifiedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-green-500/10 p-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Email Verified Successfully!
          </h1>
          <p className="text-muted-foreground">
            Your email has been verified. You can now sign in and access all features.
          </p>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Redirecting to home in {countdown} seconds...</span>
        </div>

        {/* Manual Link */}
        <button
          onClick={() => router.push('/')}
          className="text-primary hover:underline text-sm"
        >
          Click here if you&apos;re not redirected
        </button>
      </div>
    </div>
  );
}
