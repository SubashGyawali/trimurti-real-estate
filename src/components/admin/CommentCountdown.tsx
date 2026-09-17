'use client';

import { useEffect, useState } from 'react';
import { Clock3, Send, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownProps {
  status: 'pending' | 'queued' | 'awaiting_approval' | 'approved' | 'sent' | 'failed' | 'ignored';
  scheduledFor: string | null;
  confidence?: number | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof Clock3 }> = {
  pending: { label: 'Thinking...', color: 'text-amber-500', icon: Brain },
  queued: { label: 'Scheduled', color: 'text-blue-500', icon: Clock3 },
  awaiting_approval: { label: 'Needs Review', color: 'text-violet-500', icon: AlertCircle },
  approved: { label: 'Approved', color: 'text-teal-500', icon: CheckCircle },
  sent: { label: 'Sent', color: 'text-green-500', icon: Send },
  failed: { label: 'Failed', color: 'text-red-500', icon: AlertCircle },
  ignored: { label: 'Ignored', color: 'text-gray-500', icon: AlertCircle },
};

export function CommentCountdown({ status, scheduledFor, confidence }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!scheduledFor || status === 'sent' || status === 'failed' || status === 'ignored') {
      setTimeLeft('');
      return;
    }

    const update = () => {
      const now = Date.now();
      const target = new Date(scheduledFor).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Sending now...');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (minutes > 0) {
        setTimeLeft(`in ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`in ${seconds}s`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [scheduledFor, status]);

  const { label, color, icon: Icon } = STATUS_LABELS[status] || { label: status, color: 'text-gray-500', icon: Clock3 };

  return (
    <div className="flex items-center gap-2">
      <Icon className={cn('h-4 w-4', color)} />
      <span className={cn('text-sm font-medium', color)}>{label}</span>
      {timeLeft && (
        <span className="text-xs text-muted-foreground font-mono">{timeLeft}</span>
      )}
      {confidence !== null && confidence !== undefined && (
        <span className="text-xs text-muted-foreground">({Math.round(confidence * 100)}%)</span>
      )}
    </div>
  );
}