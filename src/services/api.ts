import { request, ApiError } from './http';
export { request, ApiError } from './http';
export { getMovies, getMovieHome, searchMovies, getMovie, getRecommendations, createMovie, updateMovie, deleteMovie } from './movies';
export const login = (body: { email: string; password: string }) => request('/auth/login', 'POST', body);
export const register = (body: { name: string; email: string; password: string }) => request('/auth/register', 'POST', body);
export async function logout() {
  try { await request('/auth/logout', 'POST'); }
  catch (e) { if (!(e instanceof ApiError) || e.status !== 401) throw e; }
}
export const getSession = () => request('/auth/me');
export const updateUser = (_id: number, data: unknown) => request('/users/me', 'PATCH', data);
export const getComments = (id: number) => request(`/movies/${id}/reviews`);
export const getUserComments = (id: number) => request(`/users/${id}/reviews`);
export const postComment = (id: number, _actor: number, text: string, rating?: number, photo?: string) => request(`/movies/${id}/reviews`, 'POST', { text, rating, photo });
export const updateComment = (id: number, _actor: number, data: unknown) => request(`/reviews/${id}`, 'PATCH', data);
export const deleteComment = (id: number, _actor?: number) => request(`/reviews/${id}`, 'DELETE');
export const likeComment = (id: number, _actor?: number) => request(`/reviews/${id}/like`, 'POST');
export const repostComment = (id: number, _actor?: number) => request(`/reviews/${id}/repost`, 'POST');
export const getPopularReviews = () => request('/feed/popular');
export const getFriendReviews = (_id?: number) => request('/feed/friends');
export const getAllUsers = () => request('/users');
export const updateUserRole = (id: number, role: string) => request(`/users/${id}/role`, 'PATCH', { role });
export const getUser = (id: number) => request(`/users/${id}`);
export const getUserReposts = (id: number) => request(`/users/${id}/reposts`);
export const getPublicProfile = (id: number) => request(`/users/${id}`);
export const getAchievements = (_id?: number) => request('/achievements');
export const getRewards = () => request('/rewards');
export const redeemReward = (rewardId: string) => request('/rewards/redeem', 'POST', { rewardId });
export const getFriendshipStatus = (_me: number, id: number) => request(`/friendships/status/${id}`);
export const sendFriendRequest = (_me: number, toId: number) => request('/friendships', 'POST', { toId });
export const respondFriendRequest = (id: number, accept: boolean) => request(`/friendships/${id}`, 'PATCH', { accept });
export const removeFriendship = (id: number) => request(`/friendships/${id}`, 'DELETE');
export const getPendingRequests = (_id?: number) => request('/friendships/pending');
export const getFriends = (_id?: number) => request('/friendships');
export const getNotifications = (_id?: number) => request('/notifications');
export const markNotificationRead = (id: number, _me?: number) => request(`/notifications/${id}/read`, 'PATCH');
export const markAllNotificationsRead = (_id?: number) => request('/notifications/read-all', 'PATCH');

