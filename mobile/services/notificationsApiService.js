import { apiFetch } from './apiClient';
import { partnerApiFetch } from './partnerApiClient';

function createService(fetchFn) {
  return {
    async list() {
      return fetchFn('/notifications', { auth: true });
    },
    async markRead(notificationId) {
      return fetchFn(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
        auth: true,
      });
    },
    async markAllRead() {
      return fetchFn('/notifications/read-all', {
        method: 'POST',
        auth: true,
      });
    },
  };
}

export const customerNotificationsApi = createService(apiFetch);
export const partnerNotificationsApi = createService(partnerApiFetch);
