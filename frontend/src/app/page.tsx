import { TriageDashboard } from "@/components/triage-dashboard";
import { fetchInbox } from "@/lib/api";
import { refreshInboxAction, submitFeedbackAction } from "./actions";

export default async function Page() {
  const { emails, source } = await fetchInbox();
  return (
    <TriageDashboard
      initialEmails={emails}
      source={source}
      submitFeedbackAction={submitFeedbackAction}
      refreshAction={refreshInboxAction}
    />
  );
}
