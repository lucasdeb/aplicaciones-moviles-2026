// Remove legacy local release alerts while migrating to server push.
export type ScheduledReminder = { id: string; body?: string | null; data?: Record<string, unknown> };
function isRelease(item: ScheduledReminder) {
  return item.data?.kind === 'release-reminder' || (item.data?.movieId && item.data.kind === undefined);
}
export function foreignReleaseReminders(scheduled: ScheduledReminder[], userId?: number) {
  return scheduled.filter(item => isRelease(item) && (userId === undefined || item.data?.userId !== userId)).map(item => item.id);
}
