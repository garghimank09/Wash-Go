import { partnerApi } from './partnerApi';

export const partnerProfileService = {
  get: () => partnerApi.get('/partner/profile').then((r) => r.data),
  update: (body) => partnerApi.patch('/partner/profile', body).then((r) => r.data),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('file', file);
    return partnerApi
      .post('/partner/profile/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
