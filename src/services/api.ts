import { request, ApiError } from './http';
export { request, ApiError } from './http';
export { getMovieHome, searchMovies, getMovie, getRecommendations, createMovie, updateMovie, deleteMovie } from './movies';
export const login = (body: { email: string; password: string }) => request('/auth/login', 'POST', body);
export const register = (body: { name: string; email: string; password: string }) => request('/auth/register', 'POST', body);
export async function logout() {
  try { await request('/auth/logout', 'POST'); }
  catch (e) { if (!(e instanceof ApiError) || e.status !== 401) throw e; }
}
export const getSession = () => request('/auth/me');
export const updateUser = (data: unknown) => request('/users/me', 'PATCH', data);
export const getComments = (id: number) => request(`/movies/${id}/reviews`);
export const postComment = (id: number, text: string, rating?: number, photo?: string) => request(`/movies/${id}/reviews`, 'POST', { text, rating, photo });
export const updateComment = (id: number,  data: unknown) => request(`/reviews/${id}`, 'PATCH', data);
export const deleteComment = (id: number) => request(`/reviews/${id}`, 'DELETE');
export const likeComment = (id: number) => request(`/reviews/${id}/like`, 'POST');
export const repostComment = (id: number) => request(`/reviews/${id}/repost`, 'POST');
export const getPopularReviews = () => request('/feed/popular');
export const getFriendReviews = () => request('/feed/friends');
export const getAllUsers = () => request('/users');
export const updateUserRole = (id: number, role: string) => request(`/users/${id}/role`, 'PATCH', { role });
export const getPublicProfile = (id: number) => request(`/users/${id}`);
export const getMyProfile = () => request('/users/me');
export const getAchievements = () => request('/achievements');
export const getRewards = () => request('/rewards');
export const cancelRedemption = (id: number) => request(`/rewards/redemptions/${id}`, 'DELETE');
export const redeemReward = (rewardId: string) => request('/rewards/redeem', 'POST', { rewardId });
export const getFriendshipStatus = ( id: number) => request(`/friendships/status/${id}`);
export const sendFriendRequest = ( toId: number) => request('/friendships', 'POST', { toId });
export const respondFriendRequest = (id: number, accept: boolean) => request(`/friendships/${id}`, 'PATCH', { accept });
export const removeFriendship = (id: number) => request(`/friendships/${id}`, 'DELETE');
export const getPendingRequests = () => request('/friendships/pending');
export const getFriends = () => request('/friendships');
export const getNotifications = () => request('/notifications');
export const markNotificationRead = (id: number) => request(`/notifications/${id}/read`, 'PATCH');
export const markAllNotificationsRead = () => request('/notifications/read-all', 'PATCH');

export const changePassword = (body: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => request('/auth/change-password', 'POST', body);
