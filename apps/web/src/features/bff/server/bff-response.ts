import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { BFF_ERROR_CODES, BffUpstreamError } from "@/features/bff/server/bff-error";
import { safePathForSentry } from "@/lib/sentry-scrubber";

export type BffSuccessResponse<T> = {
  data: T;
};

export type BffErrorResponse = {
  error: {
    code: string;
    message: string;
    status: number;
  };
};

export function bffData<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<BffSuccessResponse<T>>({ data }, init);
}

export function bffError(error: unknown) {
  if (error instanceof BffUpstreamError) {
    captureBffFailure(error);
    return NextResponse.json<BffErrorResponse>(
      {
        error: {
          code: error.code,
          message:
            error.status === 401
              ? "로그인이 필요합니다."
              : "데이터를 불러오지 못했습니다.",
          status: error.status,
        },
      },
      { status: error.status === 401 ? 401 : 502 },
    );
  }

  Sentry.captureException(error, {
    tags: {
      category: "bff",
      failureType: "unexpected",
    },
  });

  return NextResponse.json<BffErrorResponse>(
    {
      error: {
        code: BFF_ERROR_CODES.UPSTREAM_ERROR,
        message: "데이터를 불러오지 못했습니다.",
        status: 502,
      },
    },
    { status: 502 },
  );
}

function captureBffFailure(error: BffUpstreamError) {
  const safePath = safePathForSentry(error.upstreamPath);
  Sentry.captureMessage("BFF upstream request failed", {
    level: error.status >= 500 ? "error" : "warning",
    tags: {
      category: "bff",
      upstreamPath: safePath,
      upstreamStatus: String(error.status),
    },
    extra: {
      upstreamPath: safePath,
      status: error.status,
    },
  });
}
