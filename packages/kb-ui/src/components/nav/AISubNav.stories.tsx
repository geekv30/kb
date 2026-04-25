import type { Meta, StoryObj } from "@storybook/react-vite";
import "../../tokens.css";
import { RiMagicLine } from "@remixicon/react";
import { AISubNav, type AISubNavItem } from "./AISubNav";
import { AiIcon } from "../brand/AiIcon";

const meta: Meta<typeof AISubNav> = {
  title: "Components/Navigation/AI Sub Nav",
  component: AISubNav,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof AISubNav>;

const items: AISubNavItem[] = [
  {
    id: "ai-centre",
    icon: <AiIcon size={18} />,
    label: "AI Centre",
    kind: "section",
  },
  {
    id: "ai-optimise",
    icon: <RiMagicLine size={18} />,
    label: "AI Optimise",
    kind: "item",
  },
];

export const Default: Story = {
  render: () => (
    <div className="flex h-screen">
      <AISubNav items={items} activeId="ai-optimise" />
    </div>
  ),
};

export const AICentreActive: Story = {
  render: () => (
    <div className="flex h-screen">
      <AISubNav items={items} activeId="ai-centre" />
    </div>
  ),
};

export const NoneActive: Story = {
  render: () => (
    <div className="flex h-screen">
      <AISubNav items={items} />
    </div>
  ),
};
