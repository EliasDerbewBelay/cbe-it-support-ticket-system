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
import { Loader2, XCircle } from 'lucide-react';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  ticketNumber: string;
  onCancelled: () => void;
}

export function CancelModal({
  isOpen,
  onClose,
  ticketId,
  ticketNumber,
  onCancelled,
}: CancelModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 3) {
      toast.error('Please specify a cancellation reason (minimum 3 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      await ticketApi.cancelTicket(ticketId, reason.trim());
      toast.success(`Ticket ${ticketNumber} has been cancelled`);
      onCancelled();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Cancel Support Ticket</DialogTitle>
              <DialogDescription className="text-xs">
                Are you sure you want to cancel ticket <span className="font-mono font-medium">{ticketNumber}</span>?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason" className="text-xs font-medium">
              Cancellation Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="cancel-reason"
              placeholder="e.g., The issue resolved spontaneously after workstation reboot."
              className="text-xs min-h-[90px]"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Keep Ticket
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || reason.trim().length < 3}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
