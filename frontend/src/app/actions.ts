"use server";

import { fetchInbox, submitFeedback } from "@/lib/api";
import type { FeedbackPayload, TriagedEmail } from "@/lib/types";

export async function submitFeedbackAction(
  emailId: string,
  payload: FeedbackPayload,
): Promise<{ ok: boolean; error?: string }> {
  return submitFeedback(emailId, payload);
}

export async function refreshInboxAction(): Promise<TriagedEmail[]> {
  const { emails } = await fetchInbox();
  return emails;
}
