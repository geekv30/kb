import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
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

const labelFor = (id: string) =>
  items.find((it) => it.id === id)?.label ?? id;

function SideNavRailPlayground() {
  const [activeId, setActiveId] = React.useState<string>("editor");

  return (
    <div className="flex h-screen">
      <SideNavRail
        items={items}
        activeId={activeId}
        onItemClick={(id) => setActiveId(id)}
        brandLogo={<CompanyLogo size={24} />}
        bottomSlot={<Avatar initials="VK" />}
      />
      <div className="flex-1 bg-[#f5f5f5] flex items-center justify-center">
        <span className="text-[14px] text-[#64748b]">
          Active section: {labelFor(activeId)}
        </span>
      </div>
    </div>
  );
}

const meta: Meta<typeof SideNavRail> = {
  title: "Components/Navigation/SideNavRail",
  component: SideNavRail,
  parameters: { layout: "fullscreen" },
  globals: { backgrounds: { value: "canvas" } },
};
export default meta;

export const Playground: StoryObj<typeof SideNavRail> = {
  render: () => <SideNavRailPlayground />,
};
