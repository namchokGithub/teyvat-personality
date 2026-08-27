export type ShareStage =
  | "create_share_link"
  | "copy_link"
  | "native_share"
  | "generate_card";

function normalizeErrorCode(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  if (error instanceof Error && /^Timed out after/.test(error.message))
    return "timeout";
  if (error instanceof Error && /unique shared result id/.test(error.message))
    return "id_collision";
  if (error instanceof DOMException) return error.name.toLowerCase();
  if (error instanceof Error && error.name) return error.name.toLowerCase();
  return "unknown";
}

/**
 * Logs a Share flow failure with its stage and the real error, for
 * root-causing in development. There is no production error-reporting
 * backend for this yet.
 */
export function reportShareFailure(stage: ShareStage, error: unknown) {
  if (import.meta.env.DEV) {
    console.error(`[share:${stage}]`, normalizeErrorCode(error), error);
  }
}
