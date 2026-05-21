import { api } from './api';

export const customerProfileService = {
  get: () => api.get('/users/me/profile').then((r) => r.data),
  update: (body) => api.patch('/users/me/profile', body).then((r) => r.data),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
