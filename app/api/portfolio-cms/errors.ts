export type CmsDependency = "redis" | "telegram" | "webhook" | "cms";

export class CmsRuntimeError extends Error {
  readonly code: string;
  readonly service: CmsDependency;
  readonly operation: string;
  readonly retryable: boolean;
  readonly httpStatus?: number;

  constructor(
    code: string,
    service: CmsDependency,
    operation: string,
    retryable: boolean,
    httpStatus?: number,
    options?: ErrorOptions,
  ) {
    super(code, options);
    this.name = "CmsRuntimeError";
    this.code = code;
    this.service = service;
    this.operation = operation;
    this.retryable = retryable;
    this.httpStatus = httpStatus;
  }
}

export function dependencyError(
  error: unknown,
  fallback: [code: string, service: CmsDependency, operation: string, retryable: boolean, httpStatus?: number],
): CmsRuntimeError {
  if (error instanceof CmsRuntimeError) return error;
  return new CmsRuntimeError(...fallback, { cause: error });
}

export function safeCmsDiagnostic(error: unknown) {
  if (error instanceof CmsRuntimeError) {
    return {
      event: "portfolio_cms_update_failed",
      code: error.code,
      service: error.service,
      operation: error.operation,
      retryable: error.retryable,
      ...(error.httpStatus ? { dependencyStatus: error.httpStatus } : {}),
      category: error.cause instanceof Error ? error.cause.name : error.name,
    };
  }
  return {
    event: "portfolio_cms_update_failed",
    code: "unexpected_error",
    service: "cms" as const,
    operation: "process_update",
    retryable: true,
    category: error instanceof Error ? error.name : "unknown",
  };
}
