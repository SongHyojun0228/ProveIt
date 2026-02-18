import { TrustGrade, computeChainHash, type VerificationResult } from '@proveit/shared';
import { hashchainRepo } from '../repositories/hashchain.repo';

export const verificationService = {
  verify(projectId: string): VerificationResult {
    const entries = hashchainRepo.findByProject(projectId);
    const chainLength = entries.length;

    if (chainLength === 0) {
      return {
        valid: true,
        grade: TrustGrade.MEDIUM,
        chainLength: 0,
        message: 'No hash chain entries recorded yet. Upload sessions with hash chain data to improve trust.',
      };
    }

    // Verify chain integrity
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      // Verify index sequence
      if (entry.index !== i) {
        return {
          valid: false,
          grade: TrustGrade.LOW,
          chainLength,
          brokenAt: i,
          message: `Chain index mismatch at position ${i}: expected ${i}, got ${entry.index}`,
        };
      }

      // Verify hash computation
      const expectedHash = computeChainHash(entry.previousHash, entry.timestamp, entry.dataHash);
      if (entry.hash !== expectedHash) {
        return {
          valid: false,
          grade: TrustGrade.LOW,
          chainLength,
          brokenAt: i,
          message: `Hash mismatch at entry ${i}: chain integrity broken`,
        };
      }

      // Verify chain linkage (entry > 0 must reference previous hash)
      if (i > 0 && entry.previousHash !== entries[i - 1].hash) {
        return {
          valid: false,
          grade: TrustGrade.LOW,
          chainLength,
          brokenAt: i,
          message: `Chain linkage broken at entry ${i}: previousHash does not match prior entry`,
        };
      }
    }

    // Valid chain — grade based on length
    const grade = chainLength >= 5 ? TrustGrade.HIGH : TrustGrade.MEDIUM;
    return {
      valid: true,
      grade,
      chainLength,
      message: grade === TrustGrade.HIGH
        ? `Verified: ${chainLength} sessions with intact hash chain`
        : `Verified: ${chainLength} session(s) recorded. More sessions will increase trust level.`,
    };
  },
};
