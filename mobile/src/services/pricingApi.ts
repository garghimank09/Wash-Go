import { api } from './api';
import type { PricingResponse } from '../types/api';

export type PackageId = 'basic' | 'deluxe' | 'premium';
export type VehicleSize = 'compact' | 'sedan' | 'suv';

export const pricingApi = {
  calculate: (package_id: PackageId, vehicle_size: VehicleSize) =>
    api.post<PricingResponse>('/pricing/calculate', { package_id, vehicle_size }),
};
