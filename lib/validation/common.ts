import { ZodError } from "zod";

/**
 * Formats a ZodError into a flat Record<string, string> where the key is the field path
 * and the value is the error message.
 */
export function formatZodErrors(error: ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  error.issues.forEach((err) => {
    const path = err.path.join(".");
    formattedErrors[path] = err.message;
  });
  return formattedErrors;
}
