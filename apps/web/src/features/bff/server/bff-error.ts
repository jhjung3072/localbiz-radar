export const BFF_ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  UPSTREAM_ERROR: "BFF_UPSTREAM_ERROR",
} as const;

export type BffErrorCode =
  (typeof BFF_ERROR_CODES)[keyof typeof BFF_ERROR_CODES];

export class BffUpstreamError extends Error {
  status: number;
  upstreamPath: string;
  code: BffErrorCode;

  constructor({
    message,
    status,
    upstreamPath,
    code = BFF_ERROR_CODES.UPSTREAM_ERROR,
  }: {
    message: string;
    status: number;
    upstreamPath: string;
    code?: BffErrorCode;
  }) {
    super(message);
    this.name = "BffUpstreamError";
    this.status = status;
    this.upstreamPath = upstreamPath;
    this.code = code;
  }
}
