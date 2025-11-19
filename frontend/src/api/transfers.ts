import api from './http';

export interface CreateTransferRequest {
  beneficiaryId: number;
  sourceCountry: string;
  targetCountry: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  auditId: string;
  clientReference: string;
}

export interface TransferResponse {
  id: number;
  beneficiaryId: number;
  sourceCountry: string;
  targetCountry: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  status: string;
  niumReference: string | null;
  auditId: string | null;
  createdAt: string;
}

export async function createTransfer(body: CreateTransferRequest): Promise<TransferResponse> {
  const { data } = await api.post<TransferResponse>('/transfers', body);
  return data;
}

export async function listTransfers(): Promise<TransferResponse[]> {
  const { data } = await api.get<TransferResponse[]>('/transfers');
  return data;
}
