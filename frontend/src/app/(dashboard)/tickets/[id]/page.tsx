'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { ticketApi } from '@/lib/api/tickets';
import { Ticket, TicketComment } from '@/types/ticket';
import { StatusBadge } from '@/components/shared/status-badge';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { Timeline } from '@/components/tickets/timeline';
import { CommentsSection } from '@/components/tickets/comments-section';
import { AssignModal } from '@/components/tickets/assign-modal';
import { ResolveModal } from '@/components/tickets/resolve-modal';
import { CancelModal } from '@/components/tickets/cancel-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  User,
  Building2,
  Calendar,
  Wrench,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Archive,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';

export default function TicketDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { isEmployee, isTechnician, isAdmin } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const loadTicketData = useCallback(async () => {
    if (!id) return;
    try {
      const [ticketData, commentsData] = await Promise.all([
        ticketApi.getTicketById(id),
        ticketApi.getComments(id),
      ]);
      setTicket(ticketData);
      setComments(commentsData);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load ticket details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTicketData();
  }, [loadTicketData]);

  // Handle Technician Start Work action
  const handleStartWork = async () => {
    if (!ticket) return;
    setIsProcessingAction(true);
    try {
      await ticketApi.startWork(ticket.id);
      toast.success('Work started on ticket. Status updated to In Progress.');
      loadTicketData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to start work on ticket.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle Administrator Close Ticket action
  const handleCloseTicket = async () => {
    if (!ticket) return;
    setIsProcessingAction(true);
    try {
      await ticketApi.closeTicket(ticket.id);
      toast.success(`Ticket ${ticket.ticketNumber} formally closed and archived.`);
      loadTicketData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to close ticket.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Loader2 className="size-6 animate-spin text-[#6f1a7e]" />
        <span className="text-xs text-zinc-500 mt-2 font-medium">
          Retrieving ticket incident record...
        </span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Ticket not found or you do not have permission to view it.
        </p>
        <Link href="/tickets">
          <Button size="sm">Back to Tickets</Button>
        </Link>
      </div>
    );
  }

  const requesterName = ticket.employee
    ? `${ticket.employee.firstName || ticket.employee.first_name || ''} ${
        ticket.employee.lastName || ticket.employee.last_name || ''
      }`.trim()
    : 'Unknown Requester';

  const currentAssignment = ticket.ticketAssignments?.find((a) => a.isCurrent);
  const techName = currentAssignment?.technician
    ? `${currentAssignment.technician.firstName || currentAssignment.technician.first_name || ''} ${
        currentAssignment.technician.lastName || currentAssignment.technician.last_name || ''
      }`.trim()
    : null;

  const isClosedOrCancelled = ticket.status === 'CLOSED' || ticket.status === 'CANCELLED';

  return (
    <div className="space-y-6">
      {/* Back button & quick navigation */}
      <div className="flex items-center justify-between">
        <Link href="/tickets">
          <Button variant="ghost" size="xs" className="text-zinc-500">
            <ArrowLeft className="size-3.5 mr-1" />
            Back to Ticket List
          </Button>
        </Link>
        <span className="text-xs text-zinc-400 font-mono">ID: {ticket.id}</span>
      </div>

      {/* Main Ticket Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Incident File */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Ticket Header Card */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardHeader className="space-y-3 pb-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#6f1a7e] dark:text-purple-400 px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                    {ticket.ticketNumber}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    {ticket.category?.name || 'General Incident'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
              </div>

              <CardTitle className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {ticket.title}
              </CardTitle>

              <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  Logged {formatDate(ticket.createdAt)} ({formatRelativeTime(ticket.createdAt)})
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Building2 className="size-3.5" />
                  {ticket.department?.name || 'Information Systems'}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Incident Description
                </h4>
                <div className="p-4 rounded-lg bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs md:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap font-mono">
                  {ticket.description}
                </div>
              </div>

              {/* Resolution Banner if present */}
              {ticket.resolution && (
                <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      Resolution Summary
                    </span>
                    {ticket.resolvedAt && (
                      <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
                        {formatDate(ticket.resolvedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-950 dark:text-emerald-200 whitespace-pre-wrap leading-relaxed">
                    {ticket.resolution}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments & Diagnostic Notes Section */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardContent className="pt-6">
              <CommentsSection
                ticketId={ticket.id}
                comments={comments}
                onCommentAdded={loadTicketData}
                isClosedOrCancelled={isClosedOrCancelled}
              />
            </CardContent>
          </Card>

          {/* Lifecycle Status Transition Audit History */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#6f1a7e]" />
                Audit Trail & State Transitions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline history={ticket.ticketStatusHistory || []} />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Contextual Actions & Stakeholder Info */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Operational Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {/* Technician Controls */}
              {isTechnician && (
                <>
                  {(ticket.status === 'ASSIGNED' || ticket.status === 'OPEN') && (
                    <Button
                      onClick={handleStartWork}
                      disabled={isProcessingAction}
                      className="w-full justify-start text-xs bg-amber-600 hover:bg-amber-700 text-white"
                      size="sm"
                    >
                      <PlayCircle className="size-3.5 mr-2" />
                      Start Work (Investigate)
                    </Button>
                  )}

                  {ticket.status === 'IN_PROGRESS' && (
                    <Button
                      onClick={() => setIsResolveOpen(true)}
                      className="w-full justify-start text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      size="sm"
                    >
                      <CheckCircle2 className="size-3.5 mr-2" />
                      Mark as Resolved
                    </Button>
                  )}
                </>
              )}

              {/* Administrator Controls */}
              {isAdmin && (
                <>
                  {!isClosedOrCancelled && (
                    <Button
                      onClick={() => setIsAssignOpen(true)}
                      variant="outline"
                      className="w-full justify-start text-xs border-purple-300 text-[#6f1a7e] hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/40"
                      size="sm"
                    >
                      <Wrench className="size-3.5 mr-2" />
                      {currentAssignment ? 'Reassign Technician' : 'Assign Technician'}
                    </Button>
                  )}

                  {ticket.status === 'IN_PROGRESS' && (
                    <Button
                      onClick={() => setIsResolveOpen(true)}
                      className="w-full justify-start text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      size="sm"
                    >
                      <CheckCircle2 className="size-3.5 mr-2" />
                      Mark as Resolved
                    </Button>
                  )}

                  {ticket.status === 'RESOLVED' && (
                    <Button
                      onClick={handleCloseTicket}
                      disabled={isProcessingAction}
                      className="w-full justify-start text-xs bg-zinc-800 hover:bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900"
                      size="sm"
                    >
                      <Archive className="size-3.5 mr-2" />
                      Close & Archive Ticket
                    </Button>
                  )}

                  {(ticket.status === 'OPEN' || ticket.status === 'ASSIGNED') && (
                    <Button
                      onClick={() => setIsCancelOpen(true)}
                      variant="outline"
                      className="w-full justify-start text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/30"
                      size="sm"
                    >
                      <XCircle className="size-3.5 mr-2" />
                      Cancel Incident
                    </Button>
                  )}
                </>
              )}

              {/* Employee Controls */}
              {isEmployee && ticket.status === 'OPEN' && (
                <Button
                  onClick={() => setIsCancelOpen(true)}
                  variant="outline"
                  className="w-full justify-start text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/30"
                  size="sm"
                >
                  <XCircle className="size-3.5 mr-2" />
                  Cancel Ticket
                </Button>
              )}

              {isClosedOrCancelled && (
                <div className="p-2.5 text-center text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-800/60 rounded-md">
                  This incident is {ticket.status.toLowerCase()} and cannot accept further modifications.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requester Profile Card */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Reporting Employee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-semibold text-xs border border-blue-200 dark:border-blue-800">
                  <User className="size-4" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{requesterName}</p>
                  <p className="text-[11px] text-zinc-400">
                    ID: {ticket.employee?.employeeId || ticket.employee?.employee_id || 'CBE Staff'}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Mail className="size-3.5" />
                  <span className="truncate">{ticket.employee?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <Building2 className="size-3.5" />
                  <span>{ticket.department?.name || 'Commercial Bank of Ethiopia'}</span>
                </div>
                {ticket.employee?.phoneNumber && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Phone className="size-3.5" />
                    <span>{ticket.employee.phoneNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Support Technician Card */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Assigned IS Engineer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {techName ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center font-semibold text-xs border border-purple-200 dark:border-purple-800">
                      <Wrench className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{techName}</p>
                      <p className="text-[11px] text-zinc-400">
                        {currentAssignment?.technician?.email}
                      </p>
                    </div>
                  </div>

                  {currentAssignment?.notes && (
                    <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-300">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                        Supervisor Note:{' '}
                      </span>
                      {currentAssignment.notes}
                    </div>
                  )}

                  <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    Assigned: {formatDate(currentAssignment?.assignedAt)}
                  </div>
                </>
              ) : (
                <div className="p-4 text-center rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
                  <p className="text-xs font-medium">Unassigned</p>
                  <p className="text-[11px] mt-0.5">Awaiting IS supervisor dispatch</p>
                  {isAdmin && (
                    <Button
                      onClick={() => setIsAssignOpen(true)}
                      size="xs"
                      className="mt-3 bg-[#6f1a7e] hover:bg-[#561361] text-white"
                    >
                      Assign Technician
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {ticket && (
        <>
          <AssignModal
            isOpen={isAssignOpen}
            onClose={() => setIsAssignOpen(false)}
            ticketId={ticket.id}
            ticketNumber={ticket.ticketNumber}
            onAssigned={loadTicketData}
          />

          <ResolveModal
            isOpen={isResolveOpen}
            onClose={() => setIsResolveOpen(false)}
            ticketId={ticket.id}
            ticketNumber={ticket.ticketNumber}
            onResolved={loadTicketData}
          />

          <CancelModal
            isOpen={isCancelOpen}
            onClose={() => setIsCancelOpen(false)}
            ticketId={ticket.id}
            ticketNumber={ticket.ticketNumber}
            onCancelled={loadTicketData}
          />
        </>
      )}
    </div>
  );
}
