import { api } from './api';
import type { Car } from '../types/api';

export interface CarCreatePayload {
  make: string;
  model: string;
  year?: number | null;
  license_plate: string;
  color?: string | null;
}

export const carsApi = {
  list: () => api.get<Car[]>('/cars'),
  create: (body: CarCreatePayload) => api.post<Car>('/cars', body),
  delete: (carId: string) => api.delete(`/cars/${carId}`),
};
