import api from './http';

export interface CustomerProfileRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string; // ISO date
  countryOfResidence?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface CustomerProfileResponse extends CustomerProfileRequest {
  id: number;
  kycStatus: string;
}

export async function upsertProfile(body: CustomerProfileRequest): Promise<CustomerProfileResponse> {
  const { data } = await api.put<CustomerProfileResponse>('/customer/profile', body);
  return data;
}

export async function getProfile(): Promise<CustomerProfileResponse> {
  const { data } = await api.get<CustomerProfileResponse>('/customer/profile');
  return data;
}
