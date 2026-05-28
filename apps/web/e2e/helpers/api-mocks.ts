import type { Page, Route } from "@playwright/test";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
};

const store = {
  id: 1,
  storeName: "역삼 모닝커피",
  categoryLargeCode: "I2",
  categoryLargeName: "음식점",
  categoryMediumCode: "I212",
  categoryMediumName: "비알코올",
  categorySmallCode: "I21201",
  categorySmallName: "커피전문점",
  sido: "서울특별시",
  sigungu: "강남구",
  dong: "역삼1동",
  roadAddress: "서울특별시 강남구 테헤란로 128",
  latitude: 37.499,
  longitude: 127.032,
};

const regions = [
  {
    sidoCode: "11",
    sidoName: "서울특별시",
    sigunguList: [
      {
        sigunguCode: "11680",
        sigunguName: "강남구",
        dongList: [{ dongCode: "11680640", dongName: "역삼1동" }],
      },
      {
        sigunguCode: "11440",
        sigunguName: "마포구",
        dongList: [{ dongCode: "11440660", dongName: "서교동" }],
      },
    ],
  },
];

const masterRegions = [
  {
    ctprvnCd: "11",
    ctprvnNm: "서울특별시",
    sigunguList: [
      {
        signguCd: "11680",
        signguNm: "강남구",
        adminDongList: [{ code: "11680640", name: "역삼1동" }],
        legalDongList: [],
      },
      {
        signguCd: "11440",
        signguNm: "마포구",
        adminDongList: [{ code: "11440660", name: "서교동" }],
        legalDongList: [],
      },
    ],
  },
];

const categories = [
  {
    largeCode: "I2",
    largeName: "음식점",
    mediumCategories: [
      {
        mediumCode: "I212",
        mediumName: "비알코올",
        smallCategories: [{ smallCode: "I21201", smallName: "커피전문점" }],
      },
    ],
  },
];

const masterCategories = [
  {
    indsLclsCd: "I2",
    indsLclsNm: "음식점",
    mediumCategories: [
      {
        indsMclsCd: "I212",
        indsMclsNm: "비알코올",
        smallCategories: [{ indsSclsCd: "I21201", indsSclsNm: "커피전문점" }],
      },
    ],
  },
];

const compareResult = {
  base: {
    regionLabel: "서울특별시 강남구 역삼1동",
    totalStores: 120,
    categoryStoreCount: 22,
    categoryShare: 18.3,
    totalCategories: 30,
    topCategoryName: "커피전문점",
    competitionIndex: 18.3,
    categoryDiversityScore: 76,
    densityScore: 84,
    localBizScore: 81,
    topCategories: [
      { categoryCode: "I21201", categoryName: "커피전문점", storeCount: 22, ratio: 18.3 },
    ],
  },
  target: {
    regionLabel: "서울특별시 마포구 서교동",
    totalStores: 104,
    categoryStoreCount: 19,
    categoryShare: 18.2,
    totalCategories: 34,
    topCategoryName: "서양식",
    competitionIndex: 18.2,
    categoryDiversityScore: 82,
    densityScore: 78,
    localBizScore: 82,
    topCategories: [
      { categoryCode: "I20401", categoryName: "서양식", storeCount: 17, ratio: 16.3 },
    ],
  },
  winner: {
    regionLabel: "서울특별시 마포구 서교동",
    scoreGap: 1,
    reason: "업종 다양성이 더 높아 후보 지역으로 더 적합합니다.",
  },
  metricComparisons: [
    { metricKey: "localBizScore", metricName: "LocalBiz 점수", baseValue: 81, targetValue: 82, winner: "TARGET" },
    { metricKey: "competitionIndex", metricName: "경쟁 강도", baseValue: 18.3, targetValue: 18.2, winner: "BASE" },
    { metricKey: "categoryDiversityScore", metricName: "업종 다양성", baseValue: 76, targetValue: 82, winner: "TARGET" },
    { metricKey: "densityScore", metricName: "점포 밀도", baseValue: 84, targetValue: 78, winner: "BASE" },
  ],
};

export async function mockApi(page: Page) {
  let isAuthenticated = false;

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    const url = new URL(request.url());
    const pathname = url.pathname;

    if (pathname === "/api/auth/login") {
      const success = await handleLogin(route);
      isAuthenticated = success;
      return;
    }
    if (pathname === "/api/auth/me") {
      await fulfillAuthGuarded(route, isAuthenticated, {
        username: "admin",
        displayName: "LocalBiz Admin",
        role: "ADMIN",
      });
      return;
    }
    if (pathname === "/api/auth/refresh") {
      if (!isAuthenticated) {
        await fulfillJson(route, {
          code: "UNAUTHORIZED",
          message: "다시 로그인이 필요합니다.",
          status: 401,
        }, undefined, 401);
        return;
      }
      isAuthenticated = true;
      await fulfillJson(route, {
        user: { username: "admin", displayName: "LocalBiz Admin", role: "ADMIN" },
        accessTokenExpiresIn: 900,
        refreshTokenExpiresIn: 604800,
      }, {
        "Set-Cookie": authCookies(),
      });
      return;
    }
    if (pathname === "/api/auth/logout") {
      isAuthenticated = false;
      await fulfillJson(route, { message: "로그아웃되었습니다." }, {
        "Set-Cookie": "LOCALBIZ_ACCESS_TOKEN=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
      });
      return;
    }
    if (pathname.startsWith("/api/admin/")) {
      await fulfillAuthGuarded(route, isAuthenticated, adminResponse(pathname));
      return;
    }
    if (pathname === "/api/regions") {
      await fulfillJson(route, regions);
      return;
    }
    if (pathname === "/api/stores/categories") {
      await fulfillJson(route, categories);
      return;
    }
    if (pathname === "/api/stores") {
      await fulfillJson(route, {
        content: [store],
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      });
      return;
    }
    if (pathname === "/api/stores/map" || pathname === "/api/stores/nearby") {
      await fulfillJson(route, [store]);
      return;
    }
    if (pathname === "/api/master/regions") {
      await fulfillJson(route, masterRegions);
      return;
    }
    if (pathname === "/api/master/categories") {
      await fulfillJson(route, masterCategories);
      return;
    }
    if (pathname === "/api/analysis/summary") {
      await fulfillJson(route, {
        totalStores: 120,
        totalCategories: 30,
        topCategoryName: "커피전문점",
        competitionIndex: 18.3,
        categoryDiversityScore: 76,
        localBizScore: 81,
        selectedRegionLabel: "서울특별시 강남구",
        selectedCategoryLabel: "전체 업종",
      });
      return;
    }
    if (pathname === "/api/analysis/category-distribution") {
      await fulfillJson(route, [
        { categoryCode: "I21201", categoryName: "커피전문점", storeCount: 22, ratio: 18.3 },
        { categoryCode: "I20401", categoryName: "서양식", storeCount: 17, ratio: 14.2 },
      ]);
      return;
    }
    if (pathname === "/api/analysis/competition") {
      await fulfillJson(route, {
        targetStoreCount: 22,
        sameCategoryStoreCount: 22,
        totalStoresInArea: 120,
        competitionIndex: 18.3,
        radius: 500,
        unit: "meter",
        message: "지역 기준으로 경쟁 점포 수를 계산했습니다.",
      });
      return;
    }
    if (pathname === "/api/analysis/compare") {
      await fulfillJson(route, compareResult);
      return;
    }
    if (pathname === "/api/analysis/region-ranking") {
      await fulfillJson(route, [
        {
          rank: 1,
          ctprvnCd: "11",
          ctprvnNm: "서울특별시",
          signguCd: "11440",
          signguNm: "마포구",
          adongCd: null,
          adongNm: null,
          regionLabel: "서울특별시 마포구",
          totalStores: 104,
          categoryStoreCount: 19,
          competitionIndex: 18.2,
          categoryDiversityScore: 82,
          densityScore: 78,
          localBizScore: 82,
        },
      ]);
      return;
    }
    if (pathname === "/api/health") {
      await fulfillJson(route, { status: "ok", service: "localbiz-radar-api" });
      return;
    }

    await fulfillJson(route, {});
  });
}

async function handleLogin(route: Route) {
  const body = route.request().postDataJSON() as { username?: string; password?: string };
  if (body.username !== "admin" || body.password !== "admin1234") {
    await fulfillJson(route, {
      code: "UNAUTHORIZED",
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      status: 401,
    }, undefined, 401);
    return false;
  }

  await fulfillJson(route, {
    user: { username: "admin", displayName: "LocalBiz Admin", role: "ADMIN" },
    accessTokenExpiresIn: 900,
    refreshTokenExpiresIn: 604800,
  }, {
    "Set-Cookie": authCookies(),
  });
  return true;
}

async function fulfillAuthGuarded(route: Route, isAuthenticated: boolean, body: unknown) {
  const cookie = route.request().headers().cookie ?? "";
  if (!isAuthenticated && !cookie.includes("LOCALBIZ_ACCESS_TOKEN=")) {
    await fulfillJson(route, {
      code: "UNAUTHORIZED",
      message: "로그인이 필요합니다.",
      status: 401,
    }, undefined, 401);
    return;
  }
  await fulfillJson(route, body);
}

function adminResponse(pathname: string) {
  if (pathname === "/api/admin/sync/logs") {
    return {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    };
  }
  if (pathname === "/api/admin/sync/openapi/status") {
    return {
      enabled: true,
      serviceKeyConfigured: true,
      baseUrlConfigured: true,
      schedulerEnabled: false,
      cron: "0 0 3 * * *",
      defaultPageSize: 100,
      maxPagesPerRun: 1,
      lastSyncStartedAt: null,
      lastSyncStatus: null,
    };
  }
  if (pathname === "/api/admin/sync/master/status") {
    return {
      regionMasterCount: 3,
      categoryMasterCount: 3,
      sidoCount: 1,
      sigunguCount: 2,
      adminDongCount: 2,
      legalDongCount: 0,
      largeCategoryCount: 1,
      mediumCategoryCount: 1,
      smallCategoryCount: 1,
      lastRegionSyncAt: null,
      lastCategorySyncAt: null,
      lastRegionSyncStatus: null,
      lastCategorySyncStatus: null,
    };
  }
  if (pathname === "/api/admin/ops/overview") {
    return {
      service: {
        name: "localbiz-radar-api",
        status: "UP",
        profile: "local",
        startedAt: "2026-05-28T09:00:00",
        uptimeSeconds: 3600,
      },
      data: {
        totalStores: 120,
        storesWithCoordinates: 118,
        storesWithoutCoordinates: 2,
        regionMasterCount: 3,
        categoryMasterCount: 3,
      },
      sync: {
        lastSyncType: "STORE_OPENAPI_SYNC",
        lastSyncStatus: "SUCCESS",
        lastSyncFinishedAt: "2026-05-28T09:30:00",
        failedSyncCountLast24h: 0,
      },
    };
  }
  if (pathname === "/api/admin/ops/sync-summary") {
    return {
      days: 7,
      totalRuns: 3,
      successRuns: 2,
      partialSuccessRuns: 1,
      failedRuns: 0,
      byType: [
        {
          syncType: "STORE_OPENAPI_SYNC",
          totalRuns: 2,
          successRuns: 1,
          partialSuccessRuns: 1,
          failedRuns: 0,
        },
      ],
      recentFailures: [],
    };
  }
  if (pathname === "/api/admin/ops/data-quality") {
    return {
      totalStores: 120,
      missingCoordinateCount: 2,
      missingRoadAddressCount: 1,
      missingLotAddressCount: 3,
      missingCategoryCount: 0,
      duplicateExternalStoreCount: 0,
      coordinateCoverageRate: 98.3,
      addressCoverageRate: 99.2,
      categoryCoverageRate: 100,
    };
  }
  return {};
}

async function fulfillJson(
  route: Route,
  body: unknown,
  headers?: Record<string, string>,
  status = 200,
) {
  await route.fulfill({
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function authCookies() {
  return "LOCALBIZ_ACCESS_TOKEN=e2e-access-token; Path=/; Max-Age=900; HttpOnly; SameSite=Lax";
}
