'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { notificationApi } from '@/lib/api/notifications';
import { NotificationItem, NotificationType } from '@/types/notification';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Bell,
  CheckCheck,
  Ticket,
  UserCheck,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  MessageSquare,
  Info,
  Check,
  Trash2,
  Inbox,
  Loader2,
} from 'lucide-react';

export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const previousUnreadRef = useRef<number>(0);

  // Fetch unread count & initial list
  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await notificationApi.getNotifications({ limit: 30 });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);

      // Trigger sonner toast if unread count increased while active
      if (
        previousUnreadRef.current !== 0 &&
        data.unreadCount > previousUnreadRef.current &&
        data.notifications.length > 0
      ) {
        const latest = data.notifications[0];
        toast.info(latest.title, {
          description: latest.message,
        });
      }
      previousUnreadRef.current = data.unreadCount;
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Periodic polling every 20 seconds for near real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications(true);
    }, 20000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: true, read_at: new Date().toISOString() } : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    setIsMarkingAll(true);
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      toast.error('Could not mark all notifications as read.');
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(id);
      const target = notifications.find((n) => n.id === id);
      if (target && !target.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Click on a notification item
  const handleItemClick = (item: NotificationItem) => {
    if (!item.is_read) {
      handleMarkAsRead(item.id);
    }
    setIsOpen(false);
    if (item.ticket_id) {
      router.push(`/tickets/${item.ticket_id}`);
    }
  };

  // Render icon according to notification type
  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case 'TICKET_CREATED':
        return (
          <div className="size-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/60">
            <Ticket className="size-4" />
          </div>
        );
      case 'TICKET_ASSIGNED':
        return (
          <div className="size-8 rounded-lg bg-purple-50 text-[#6f1a7e] dark:bg-purple-950/50 dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-200/60 dark:border-purple-800/60">
            <UserCheck className="size-4" />
          </div>
        );
      case 'STATUS_CHANGED':
        return (
          <div className="size-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/60">
            <RefreshCw className="size-4" />
          </div>
        );
      case 'TICKET_RESOLVED':
        return (
          <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
            <CheckCircle2 className="size-4" />
          </div>
        );
      case 'TICKET_CLOSED':
        return (
          <div className="size-8 rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
            <ShieldCheck className="size-4" />
          </div>
        );
      case 'TICKET_CANCELLED':
        return (
          <div className="size-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/60 dark:border-rose-800/60">
            <XCircle className="size-4" />
          </div>
        );
      case 'COMMENT_ADDED':
        return (
          <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-800/60">
            <MessageSquare className="size-4" />
          </div>
        );
      default:
        return (
          <div className="size-8 rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
            <Info className="size-4" />
          </div>
        );
    }
  };

  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) loadNotifications(true);
        }}
        aria-label="User notifications"
        aria-expanded={isOpen}
        className="relative p-2 rounded-xl text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200/80 dark:hover:border-zinc-800 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#6f1a7e]/30"
      >
        <Bell className="size-4.5" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#6f1a7e] rounded-full shadow-xs ring-2 ring-white dark:ring-zinc-950 animate-in zoom-in-50 duration-200">
            {unreadCount > 99 ? '99+' : unreadCount}
            <span className="absolute -inset-0.5 rounded-full bg-[#6f1a7e] opacity-30 animate-ping -z-10" />
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Popover Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#6f1a7e]/10 text-[#6f1a7e] dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAll}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#6f1a7e] dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors disabled:opacity-50"
                  title="Mark all as read"
                >
                  {isMarkingAll ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <CheckCheck className="size-3.5" />
                  )}
                  <span>Mark read</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 px-3 pt-2 pb-1 border-b border-zinc-100 dark:border-zinc-800/60 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'unread'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications Scrollable List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 [scrollbar-width:thin]">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-zinc-400 gap-2">
                <Loader2 className="size-5 animate-spin text-[#6f1a7e]" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 flex items-center justify-center mb-2.5">
                  <Inbox className="size-6" />
                </div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-[11px] text-zinc-400 max-w-[220px] mt-0.5">
                  {activeTab === 'unread'
                    ? "You're all caught up with your latest updates."
                    : 'System alerts and ticket updates will appear here.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-start gap-3 p-3 transition-colors cursor-pointer group relative ${
                    item.is_read
                      ? 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 bg-white dark:bg-zinc-950 opacity-90'
                      : 'bg-purple-50/30 dark:bg-purple-950/20 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 font-medium'
                  }`}
                >
                  {/* Category / Action Icon */}
                  {renderIcon(item.type)}

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`text-xs truncate ${
                          item.is_read
                            ? 'text-zinc-700 dark:text-zinc-300 font-medium'
                            : 'text-zinc-900 dark:text-zinc-100 font-semibold'
                        }`}
                      >
                        {item.title}
                      </span>
                      {!item.is_read && (
                        <span className="size-1.5 rounded-full bg-[#6f1a7e] dark:bg-purple-400 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      {item.ticket && (
                        <span className="px-1.5 py-0.2 text-[10px] font-mono font-medium rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {item.ticket.ticket_number}
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-400">
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons on Hover */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!item.is_read && (
                      <button
                        onClick={(e) => handleMarkAsRead(item.id, e)}
                        className="p-1 rounded-md text-zinc-400 hover:text-[#6f1a7e] dark:hover:text-purple-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Mark as read"
                      >
                        <Check className="size-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteNotification(item.id, e)}
                      className="p-1 rounded-md text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Dismiss notification"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Popover Footer */}
          <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between text-[11px] text-zinc-500">
            <span>CBE Support Desk Updates</span>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/tickets');
              }}
              className="text-[#6f1a7e] dark:text-purple-300 hover:underline font-medium"
            >
              View tickets
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
