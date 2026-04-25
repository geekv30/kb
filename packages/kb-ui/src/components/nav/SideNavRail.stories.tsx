import type { Meta, StoryObj } from "@storybook/react-vite";
import "../../tokens.css";
import {
  RiQuillPenLine,
  RiFolderLine,
  RiSettings5Line,
} from "@remixicon/react";
import { SideNavRail } from "./SideNavRail";
import { Avatar } from "../primitives/Avatar";
import { CompanyLogo } from "../brand/CompanyLogo";
import { AiIcon } from "../brand/AiIcon";

const meta: Meta<typeof SideNavRail> = {
  title: "Components/Navigation/SideNavRail",
  component: SideNavRail,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof SideNavRail>;

const items = [
  { id: "ai", icon: <AiIcon size={16} />, label: "AI" },
  { id: "editor", icon: <RiQuillPenLine size={16} />, label: "Editor" },
  { id: "folders", icon: <RiFolderLine size={16} />, label: "Folders" },
  { id: "settings", icon: <RiSettings5Line size={16} />, label: "Settings" },
];

export const Dark: Story = {
  render: () => (
    <div style={{ height: "100vh", display: "flex" }}>
      <SideNavRail
        theme="dark"
        items={items}
        activeId="editor"
        brandLogo={<CompanyLogo size={24} />}
        bottomSlot={<Avatar initials="VK" />}
      />
    </div>
  ),
};

export const Light: Story = {
  render: () => (
    <div style={{ height: "100vh", display: "flex" }}>
      <SideNavRail
        theme="light"
        items={items}
        activeId="editor"
        brandLogo={<CompanyLogo size={24} />}
        bottomSlot={<Avatar initials="VK" />}
      />
    </div>
  ),
};

export const BothThemes: Story = {
  render: () => (
    <div style={{ height: "100vh", display: "flex", gap: 16 }}>
      <SideNavRail
        theme="dark"
        items={items}
        activeId="editor"
        brandLogo={<CompanyLogo size={24} />}
        bottomSlot={<Avatar initials="VK" />}
      />
      <SideNavRail
        theme="light"
        items={items}
        activeId="editor"
        brandLogo={<CompanyLogo size={24} />}
        bottomSlot={<Avatar initials="VK" />}
      />
    </div>
  ),
};
