'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ticketApi } from '@/lib/api/tickets';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  ticketNumber: string;
  onResolved: () => void;
}

export function ResolveModal({
  isOpen,
  onClose,
  ticketId,
  ticketNumber,
  onResolved,
}: ResolveModalProps) {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes.trim() || resolutionNotes.trim().length < 5) {
      toast.error('Resolution notes must be at least 5 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await ticketApi.resolveTicket(ticketId, resolutionNotes.trim());
      toast.success(`Ticket ${ticketNumber} marked as Resolved`);
      onResolved();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to mark ticket resolved');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Mark Ticket as Resolved</DialogTitle>
              <DialogDescription className="text-xs">
                Document the remedial action taken for <span className="font-mono font-medium">{ticketNumber}</span>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="resolution-notes" className="text-xs font-medium">
              Mandatory Resolution Details <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="resolution-notes"
              placeholder="e.g., Replaced damaged network patch cable at workstation PC-04 and verified gateway connectivity. User confirmed successful logon."
              className="text-xs min-h-[110px]"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              required
            />
            <p className="text-[11px] text-zinc-400">
              Provide clear diagnostic findings and corrective steps for auditing and institutional knowledge.
            </p>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || resolutionNotes.trim().length < 5}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Resolving...
                </>
              ) : (
                'Confirm Resolution'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
