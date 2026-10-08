import { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { handleApiError } from '@/libs/axios';

/**
 * Backend validation error structure
 */
export interface BackendValidationError {
  path: string;
  msg: string;
  location?: string;
  type?: string;
  value?: any;
}

/**
 * Extract backend validation errors from API error response
 */
export function extractBackendErrors(
  error: any
): BackendValidationError[] | null {
  const errors =
    error?.response?.data?.errors || error?.data?.errors || error?.errors;

  if (Array.isArray(errors) && errors.length > 0) {
    return errors as BackendValidationError[];
  }

  return null;
}

/**
 * Set backend validation errors to form fields
 */
export function setBackendFormErrors<T extends FieldValues>(
  errors: BackendValidationError[],
  setError: UseFormSetError<T>
): void {
  errors.forEach((error) => {
    if (error.path && error.msg) {
      setError(error.path as Path<T>, {
        type: 'manual',
        message: error.msg,
      });
    }
  });
}

/**
 * One line for a toast: the backend's validation messages when it sent some (a 400 from
 * express-validator has `errors` but no `message`), otherwise handleApiError's message.
 */
export function describeApiError(error: unknown): string {
  const errors = extractBackendErrors(error);
  if (errors) {
    return Array.from(new Set(errors.map((e) => e.msg).filter(Boolean))).join(', ');
  }
  return handleApiError(error);
}
