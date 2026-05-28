import type { Preview } from "@storybook/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../src/app/globals.css";

const originalFetch = globalThis.fetch?.bind(globalThis);

if (originalFetch && !("__localBizStorybookFetchMocked" in globalThis)) {
  Object.defineProperty(globalThis, "__localBizStorybookFetchMocked", {
    value: true,
  });

  globalThis.fetch = async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    if (url.includes("/api/auth/me") || url.includes("/api/auth/refresh")) {
      return new Response(JSON.stringify({ message: "로그인이 필요합니다." }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return originalFetch(input, init);
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const preview: Preview = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-slate-50 p-6 text-slate-950">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
        query: {},
      },
    },
    a11y: {
      test: "todo",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
