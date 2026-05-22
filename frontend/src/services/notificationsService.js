import { api } from './api';
import { partnerApi } from './partnerApi';

/** @param {import('axios').AxiosInstance} client */
export function createNotificationsService(client) {
  return {
    list: () => client.get('/notifications').then((r) => r.data),
    markRead: (id) => client.patch(`/notifications/${id}/read`).then((r) => r.data),
    markAllRead: () => client.post('/notifications/read-all').then((r) => r.data),
  };
}

export const notificationsService = createNotificationsService(api);
export const partnerNotificationsService = createNotificationsService(partnerApi);
