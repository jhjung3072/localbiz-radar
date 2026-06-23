"use client";

import { Profiler, type ProfilerOnRenderCallback, type ReactNode } from "react";

type RenderProfilerProps = {
  id: string;
  onRender: ProfilerOnRenderCallback;
  children: ReactNode;
};

export function RenderProfiler({ id, onRender, children }: RenderProfilerProps) {
  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}
