import api from './http';

export interface BeneficiaryRequest {
  fullName: string;
  country: string;
  bankName?: string;
  accountNumber: string;
  routingCode?: string;
  payoutMethod: string;
  destinationCurrency: string;
}

export interface BeneficiaryResponse extends BeneficiaryRequest {
  id: number;
}

export async function createBeneficiary(body: BeneficiaryRequest): Promise<BeneficiaryResponse> {
  const { data } = await api.post<BeneficiaryResponse>('/beneficiaries', body);
  return data;
}

export async function listBeneficiaries(): Promise<BeneficiaryResponse[]> {
  const { data } = await api.get<BeneficiaryResponse[]>('/beneficiaries');
  return data;
}
