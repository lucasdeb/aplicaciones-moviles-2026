export type PushDestination = { screen: 'MovieDetail'; params: { movieId: number } } | { screen: 'UserProfile'; params: { userId: number } };
export function pushDestination(data: Record<string, unknown> | undefined): PushDestination | null {
  const positive = (value: unknown): value is number => Number.isInteger(value) && (value as number) > 0;
  if (data?.kind === 'friend-request' && positive(data.userId)) return { screen: 'UserProfile', params: { userId: data.userId } };
  if (data && ['release-reminder', 'review-like', 'review-repost'].includes(String(data.kind)) && positive(data.movieId)) {
    return { screen: 'MovieDetail', params: { movieId: data.movieId } };
  }
  return null;
}
