export function afterNextPaint(callback: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}

export function nowOrNull() {
  return typeof performance === "undefined" ? null : performance.now();
}
