'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminApi } from '@/lib/api/admin';
import { ticketApi } from '@/lib/api/tickets';
import { CategoryItem } from '@/types/admin';
import { TicketPriority } from '@/types/ticket';
import { toast } from 'sonner';
import { Loader2, Send, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTicketPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map category IDs to human-readable names for presentation
  const categoryItemsMap = useMemo(() => {
    return Object.fromEntries(categories.map((c) => [c.id, c.name]));
  }, [categories]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await adminApi.getCategories(false);
        const safeData = Array.isArray(data) ? data : [];
        setCategories(safeData);
        if (safeData.length > 0) {
          setCategoryId((prev) => prev || safeData[0].id);
        }
      } catch {
        toast.error('Failed to load incident categories.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleQuickSuggestion = (suggestedTitle: string, suggestedDesc: string) => {
    setTitle(suggestedTitle);
    setDescription(suggestedDesc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !categoryId) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await ticketApi.createTicket({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        priority,
      });

      toast.success(`Support ticket ${created.ticketNumber} created successfully!`);
      router.push(`/tickets/${created.id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit support ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/tickets">
          <Button variant="ghost" size="xs" className="text-zinc-500">
            <ArrowLeft className="size-3.5 mr-1" />
            Back to Tickets
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Log Support Ticket"
        description="Submit an IT service request or infrastructure malfunction report to the IS Department."
      />

      {/* Quick Suggestion Chips */}
      <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6f1a7e] dark:text-purple-300">
          <Sparkles className="size-3.5" />
          <span>Common Branch Incident Templates</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              handleQuickSuggestion(
                'Core Banking Terminal disconnected from LAN',
                'Branch teller PC-03 is experiencing persistent Socket 10054 connection timeout errors when connecting to the core banking server gateway.'
              )
            }
            className="px-2.5 py-1 rounded-md text-xs bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800 text-zinc-700 dark:text-zinc-300 hover:border-[#6f1a7e] transition-colors"
          >
            Core Banking Terminal Error
          </button>
          <button
            type="button"
            onClick={() =>
              handleQuickSuggestion(
                'Branch Passbook / Receipt Printer Paper Feed Malfunction',
                'The teller counter passbook printer is showing red hardware fault LED and failing to feed deposit slips.'
              )
            }
            className="px-2.5 py-1 rounded-md text-xs bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800 text-zinc-700 dark:text-zinc-300 hover:border-[#6f1a7e] transition-colors"
          >
            Passbook Printer Jam
          </button>
          <button
            type="button"
            onClick={() =>
              handleQuickSuggestion(
                'Active Directory account locked after password expiration',
                'User unable to authenticate into branch desktop workstation. System reports account lock out policy triggered.'
              )
            }
            className="px-2.5 py-1 rounded-md text-xs bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800 text-zinc-700 dark:text-zinc-300 hover:border-[#6f1a7e] transition-colors"
          >
            AD Account Lockout
          </button>
        </div>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Incident Details</CardTitle>
            <CardDescription className="text-xs">
              Provide thorough descriptions to expedite triage and resolution by IS engineers.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="ticket-title" className="text-xs font-medium">
                Incident Summary / Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ticket-title"
                placeholder="Brief summary of the issue (e.g. Core banking terminal error PC-02)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                required
                className="text-xs"
              />
            </div>

            {/* Category and Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category-select" className="text-xs font-medium">
                  Incident Category <span className="text-red-500">*</span>
                </Label>
                {isLoadingCategories ? (
                  <div className="h-9 border border-input rounded-lg flex items-center gap-2 px-3 text-xs text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <Loader2 className="size-3.5 animate-spin text-[#6f1a7e]" />
                    <span>Loading categories...</span>
                  </div>
                ) : (
                  <Select
                    value={categoryId}
                    onValueChange={(val) => setCategoryId(val || '')}
                    items={categoryItemsMap}
                  >
                    <SelectTrigger id="category-select" className="h-9 text-xs">
                      <SelectValue placeholder="Select Category">
                        {(val) => {
                          if (!val) return 'Select Category';
                          return categoryItemsMap[val] ?? 'Select Category';
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-xs">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priority-select" className="text-xs font-medium">
                  Operational Urgency / Priority <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={priority}
                  onValueChange={(val) => {
                    if (val) setPriority(val as TicketPriority);
                  }}
                >
                  <SelectTrigger id="priority-select" className="h-9 text-xs">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW" className="text-xs">
                      Low (Minor inconvenience, workaround exists)
                    </SelectItem>
                    <SelectItem value="MEDIUM" className="text-xs">
                      Medium (Standard workstation disruption)
                    </SelectItem>
                    <SelectItem value="HIGH" className="text-xs">
                      High (Direct teller or customer service impact)
                    </SelectItem>
                    <SelectItem value="CRITICAL" className="text-xs font-semibold text-red-600">
                      Critical (Branch-wide outage or service shutdown)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="ticket-description" className="text-xs font-medium">
                Detailed Description & Error Symptoms <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="ticket-description"
                placeholder="Include workstation number, branch location, exact error codes, and steps taken before the error appeared..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs min-h-[140px]"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <Link href="/tickets">
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !title.trim() || !description.trim() || !categoryId}
              className="bg-[#6f1a7e] hover:bg-[#561361] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Submitting Ticket...
                </>
              ) : (
                <>
                  <Send className="size-3.5 mr-1.5" />
                  Submit Support Ticket
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
