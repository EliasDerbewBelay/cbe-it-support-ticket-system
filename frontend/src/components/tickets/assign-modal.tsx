'use client';

import React, { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminApi } from '@/lib/api/admin';
import { ticketApi } from '@/lib/api/tickets';
import { ActiveTechnician } from '@/types/admin';
import { toast } from 'sonner';
import { Loader2, UserCheck } from 'lucide-react';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  ticketNumber: string;
  onAssigned: () => void;
}

export function AssignModal({
  isOpen,
  onClose,
  ticketId,
  ticketNumber,
  onAssigned,
}: AssignModalProps) {
  const [technicians, setTechnicians] = useState<ActiveTechnician[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadTechnicians = async () => {
        setIsLoading(true);
        try {
          const data = await adminApi.getActiveTechnicians();
          const safeData = Array.isArray(data) ? data : [];
          setTechnicians(safeData);
          if (safeData.length > 0 && !selectedTechId) {
            setSelectedTechId(safeData[0].id);
          }
        } catch {
          toast.error('Failed to load active technicians.');
        } finally {
          setIsLoading(false);
        }
      };
      loadTechnicians();
    }
  }, [isOpen, selectedTechId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) {
      toast.error('Please select an active technician.');
      return;
    }

    setIsSubmitting(true);
    try {
      await ticketApi.assignTicket(ticketId, selectedTechId, notes || undefined);
      toast.success(`Technician assigned to ${ticketNumber}`);
      onAssigned();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to assign technician');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-[#6f1a7e]/10 text-[#6f1a7e] flex items-center justify-center">
              <UserCheck className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Assign Support Technician</DialogTitle>
              <DialogDescription className="text-xs">
                Assign incident <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{ticketNumber}</span> to an IS engineer.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="tech-select" className="text-xs font-medium">
              Select IS Support Technician
            </Label>
            {isLoading ? (
              <div className="flex items-center gap-2 p-2.5 text-xs text-zinc-500 border rounded-md">
                <Loader2 className="size-3.5 animate-spin" />
                <span>Loading technicians...</span>
              </div>
            ) : (
              <Select value={selectedTechId} onValueChange={(val) => setSelectedTechId(val || '')}>
                <SelectTrigger id="tech-select" className="h-9 text-xs">
                  <SelectValue placeholder="Choose a technician..." />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      {t.firstName} {t.lastName} ({t.activeAssignmentsCount} active tickets)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assign-notes" className="text-xs font-medium">
              Assignment Notes / Instructions (Optional)
            </Label>
            <Textarea
              id="assign-notes"
              placeholder="e.g., Priority dispatch: Please check the switch port on 2nd floor."
              className="text-xs min-h-[80px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isLoading || !selectedTechId}
              className="bg-[#6f1a7e] hover:bg-[#561361] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Confirm Assignment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
