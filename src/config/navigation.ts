import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  MessageSquareWarning,
  Puzzle,
  Siren,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  section: "core" | "extensible";
  description?: string;
}

/**
 * Central navigation registry.
 * Add new admin modules here and create a matching route under /dashboard/<id>.
 */
export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "core",
  },
  {
    id: "events",
    label: "Events",
    href: "/dashboard/events",
    icon: CalendarDays,
    section: "core",
  },
  {
    id: "surveys",
    label: "Surveys",
    href: "/dashboard/surveys",
    icon: ClipboardList,
    section: "core",
  },
  {
    id: "complaints",
    label: "Complaints",
    href: "/dashboard/complaints",
    icon: MessageSquareWarning,
    section: "core",
  },
  {
    id: "air-raid",
    label: "Air Raid",
    href: "/dashboard/air-raid",
    icon: Siren,
    section: "core",
  },
  {
    id: "modules",
    label: "Future Modules",
    href: "/dashboard/modules",
    icon: Puzzle,
    section: "extensible",
    description: "Reserved workspace for upcoming admin features",
  },
];
