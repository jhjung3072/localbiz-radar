import type { Meta, StoryObj } from "@storybook/nextjs";
import { AppShell } from "@/components/layout/app-shell";

const meta = {
  title: "Layout/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: null,
  },
  render: () => (
    <AppShell>
      <section className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">
          LocalBiz Radar
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          공통 shell 안에서 header, navigation, 본문 여백을 확인합니다.
        </p>
      </section>
    </AppShell>
  ),
};
