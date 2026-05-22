import { api } from './api';

export const placesService = {
  autocomplete: (input, sessionToken) =>
    api
      .get('/places/autocomplete', {
        params: {
          input: input.trim(),
          ...(sessionToken ? { session_token: sessionToken } : {}),
        },
      })
      .then((r) => r.data),
};
