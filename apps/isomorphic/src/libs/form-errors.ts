import { UseFormSetError, FieldValues, Path } from 'react-hook-form';

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
