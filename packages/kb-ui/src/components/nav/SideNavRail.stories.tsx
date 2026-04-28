import type { Meta, StoryObj } from "@storybook/react-vite";
import "../../tokens.css";
import {
  RiQuillPenLine,
  RiBarChartBoxLine,
  RiSettings5Line,
} from "@remixicon/react";
import { SideNavRail } from "./SideNavRail";
import { Avatar } from "../primitives/Avatar";
import { CompanyLogo } from "../brand/CompanyLogo";
import { AiIcon } from "../brand/AiIcon";

const items = [
  { id: "ai", icon: <AiIcon size={16} />, label: "AI" },
  { id: "editor", icon: <RiQuillPenLine size={16} />, label: "Editor" },
  { id: "analytics", icon: <RiBarChartBoxLine size={16} />, label: "Analytics" },
  { id: "settings", icon: <RiSettings5Line size={16} />, label: "Settings" },
];

const meta: Meta<typeof SideNavRail> = {
  title: "Components/Navigation/SideNavRail",
  component: SideNavRail,
  parameters: { layout: "fullscreen" },
  args: {
    theme: "light",
    items,
    activeId: "editor",
  },
  render: (args) => (
    <div style={{ height: "100vh", display: "flex" }}>
      <SideNavRail
        {...args}
        brandLogo={<CompanyLogo size={24} />}
        bottomSlot={<Avatar initials="VK" />}
      />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof SideNavRail> = {};
