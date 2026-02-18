import { ZodSchema, ZodError } from 'zod';
import { logError } from '../utils/logger';

export function validateAndParse<T>(schema: ZodSchema<T>, data: unknown): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      logError('Schema validation failed', error.message);
    }
    return null;
  }
}
