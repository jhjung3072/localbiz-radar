export type QueryValue = string | number | boolean | null | undefined;

export function toSearchParams(params: Record<string, QueryValue>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
}

export function pickSearchParams(
  params: URLSearchParams,
  allowedKeys: string[],
) {
  const picked: Record<string, string> = {};

  allowedKeys.forEach((key) => {
    const value = params.get(key);
    if (value !== null && value !== "" && value !== "all") {
      picked[key] = value;
    }
  });

  return picked;
}

export function getNumberParam(
  params: URLSearchParams,
  key: string,
  defaultValue: number,
) {
  const value = Number(params.get(key));
  return Number.isFinite(value) && value >= 0 ? value : defaultValue;
}

export function buildUrl(path: string, params?: URLSearchParams) {
  const query = params?.toString();
  return query ? `${path}?${query}` : path;
}
