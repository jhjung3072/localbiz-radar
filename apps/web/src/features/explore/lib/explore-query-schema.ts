import { z } from "zod";
import type { ExploreQueryState } from "@/features/explore/types";

const stringValue = z.string().trim().catch("");
const selectValue = z.string().trim().catch("all");
const positiveInt = (defaultValue: number, maxValue: number) =>
  z.coerce
    .number()
    .int()
    .min(0)
    .max(maxValue)
    .catch(defaultValue);
const boundedNumber = (min: number, max: number) =>
  z.coerce.number().min(min).max(max).optional().catch(undefined);

export const exploreQuerySchema = z.object({
  keyword: stringValue.transform((value) => value.slice(0, 80)),
  ctprvnCd: selectValue,
  ctprvnNm: stringValue,
  signguCd: selectValue,
  signguNm: stringValue,
  adongCd: selectValue,
  adongNm: stringValue,
  indsLclsCd: selectValue,
  indsLclsNm: stringValue,
  indsMclsCd: selectValue,
  indsMclsNm: stringValue,
  indsSclsCd: selectValue,
  indsSclsNm: stringValue,
  page: positiveInt(0, 9999),
  size: z.coerce.number().int().min(1).max(100).catch(10),
  lat: boundedNumber(-90, 90),
  lng: boundedNumber(-180, 180),
  radius: z.coerce.number().int().min(100).max(3000).catch(500),
  zoom: z.coerce.number().int().min(1).max(14).optional().catch(undefined),
}) satisfies z.ZodType<ExploreQueryState>;

export const DEFAULT_EXPLORE_QUERY: ExploreQueryState = {
  keyword: "",
  ctprvnCd: "all",
  ctprvnNm: "",
  signguCd: "all",
  signguNm: "",
  adongCd: "all",
  adongNm: "",
  indsLclsCd: "all",
  indsLclsNm: "",
  indsMclsCd: "all",
  indsMclsNm: "",
  indsSclsCd: "all",
  indsSclsNm: "",
  page: 0,
  size: 10,
  radius: 500,
};
