export interface HashEntry {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: string;
  dataHash: string;
}

export enum TrustGrade {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface VerificationResult {
  valid: boolean;
  grade: TrustGrade;
  chainLength: number;
  brokenAt?: number;
  message: string;
}
