import { afterEach, describe, expect, it } from "vitest";
import {
  getSpringApiBaseUrl,
  springApiUrl,
} from "@/features/bff/server/spring-api-client";

describe("Spring API server client", () => {
  const originalSpringBaseUrl = process.env.SPRING_API_BASE_URL;
  const originalPublicBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  afterEach(() => {
    process.env.SPRING_API_BASE_URL = originalSpringBaseUrl;
    process.env.NEXT_PUBLIC_API_BASE_URL = originalPublicBaseUrl;
  });

  it("uses server-only SPRING_API_BASE_URL first", () => {
    process.env.SPRING_API_BASE_URL = "http://api:8080/";
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost";

    expect(getSpringApiBaseUrl()).toBe("http://api:8080");
    expect(springApiUrl("/api/health")).toBe("http://api:8080/api/health");
  });

  it("falls back to public API base URL for local compatibility", () => {
    delete process.env.SPRING_API_BASE_URL;
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";

    expect(springApiUrl("api/health")).toBe("http://localhost:8080/api/health");
  });
});
