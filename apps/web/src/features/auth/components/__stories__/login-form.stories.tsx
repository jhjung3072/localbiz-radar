import type { Meta, StoryObj } from "@storybook/nextjs";
import { LoginForm } from "@/features/auth/components/login-form";

const meta = {
  title: "Auth/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
