import api from './http';

export interface FxQuoteRequest {
  sourceCountry: string;
  targetCountry: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
}

export interface FxQuoteResponse extends FxQuoteRequest {
  targetAmount: number;
  rate: number;
  auditId: string;
}

export async function getQuote(body: FxQuoteRequest): Promise<FxQuoteResponse> {
  const { data } = await api.post<FxQuoteResponse>('/fx/quote', body);
  return data;
}
