'use client';

import React, { useState } from 'react';
import { TicketComment } from '@/types/ticket';
import { useAuth } from '@/hooks/use-auth';
import { ticketApi } from '@/lib/api/tickets';
import { RoleBadge } from '@/components/shared/role-badge';
import { formatRelativeTime, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageSquare, ShieldAlert, Send, Loader2 } from 'lucide-react';

interface CommentsSectionProps {
  ticketId: string;
  comments: TicketComment[];
  onCommentAdded: () => void;
  isClosedOrCancelled?: boolean;
}

export function CommentsSection({
  ticketId,
  comments,
  onCommentAdded,
  isClosedOrCancelled,
}: CommentsSectionProps) {
  const { isEmployee } = useAuth();
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await ticketApi.addComment(ticketId, content.trim(), isEmployee ? false : isInternal);
      setContent('');
      setIsInternal(false);
      toast.success('Note added successfully');
      onCommentAdded();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeComments = Array.isArray(comments) ? comments : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <MessageSquare className="size-4 text-zinc-500" />
          <span>Discussion & Diagnostic Notes</span>
          <span className="text-xs font-normal text-zinc-400">({safeComments.length})</span>
        </h3>
      </div>

      {/* List of comments */}
      <div className="space-y-3">
        {safeComments.length === 0 ? (
          <div className="p-4 text-center rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
            No updates posted on this ticket yet.
          </div>
        ) : (
          safeComments.map((comment) => {
            const authorName = comment.author
              ? `${comment.author.firstName || comment.author.first_name || ''} ${
                  comment.author.lastName || comment.author.last_name || ''
                }`.trim()
              : 'Unknown User';

            return (
              <div
                key={comment.id}
                className={`p-3.5 rounded-xl border text-xs transition-colors ${
                  comment.isInternal
                    ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {authorName}
                    </span>
                    {comment.author?.role && <RoleBadge role={comment.author.role} />}
                    {comment.isInternal && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        <ShieldAlert className="size-3" />
                        Internal IS Note
                      </span>
                    )}
                  </div>

                  <span
                    className="text-[11px] text-zinc-400"
                    title={formatDate(comment.createdAt)}
                  >
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* New Comment Input Form */}
      {!isClosedOrCancelled ? (
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div className="space-y-2">
            <Textarea
              placeholder="Post a diagnostic note, update, or question..."
              className="text-xs min-h-[85px] bg-white dark:bg-zinc-900"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />

            {!isEmployee && (
              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-[#6f1a7e] focus:ring-[#6f1a7e]"
                  />
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldAlert className="size-3.5 text-amber-600 dark:text-amber-400" />
                    Internal IS Diagnostic Note (Hidden from employee)
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !content.trim()}
              className="bg-[#6f1a7e] hover:bg-[#561361] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="size-3.5 mr-1.5" />
                  Post Update
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-3 text-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-500">
          This ticket is closed or cancelled. Further comments are disabled.
        </div>
      )}
    </div>
  );
}
