
export interface ObfuscationResult {
  version: string;
  techniques: string[];
  readability: string;
  evasionScore: number; // 0 - 100
  complexity: 'Low' | 'Medium' | 'High';
}

export interface ObfuscationInput {
  name: string;
  address: string;
}

export interface AddressAnalysis {
  isValid: boolean;
  standardized: string;
  regionHint: string;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface ObfuscationResponse {
  variations: ObfuscationResult[];
  analysis: AddressAnalysis;
  sources?: GroundingSource[];
}
