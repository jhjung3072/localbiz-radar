const baseUrl = process.env.LHCI_BASE_URL ?? "http://localhost:3100";
const outputDir = process.env.LHCI_OUTPUT_DIR ?? "../../docs/performance/raw/lhci-current";
const numberOfRuns = Number(process.env.LHCI_NUMBER_OF_RUNS ?? "5");

const routes = [
  "/",
  "/dashboard",
  "/stores",
  "/map",
  "/compare",
  "/admin/login",
];

module.exports = {
  ci: {
    collect: {
      url: routes.map((route) => `${baseUrl}${route}`),
      numberOfRuns,
      settings: {
        chromeFlags: "--headless=new --no-sandbox --disable-dev-shm-usage",
        preset: "desktop",
      },
    },
    upload: {
      target: "filesystem",
      outputDir,
    },
  },
};
