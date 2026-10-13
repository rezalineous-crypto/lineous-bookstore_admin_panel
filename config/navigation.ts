import {
  BookOpen,
  LayoutDashboard,
  Users,
  ShoppingCart,
  Library,
  FolderTree,
  ListTree,
  Star,
  Building2,
  BarChart3,
} from "lucide-react";

export const navigation = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Books",
    href: "/admin/books",
    icon: BookOpen,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Publications",
    href: "/admin/publications",
    icon: Building2,
  },

  {
    title: "Subjects",
    href: "/admin/subjects",
    icon: Library,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Menu Tree",
    href: "/admin/menu-tree",
    icon: ListTree,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Sales Analytics",
    href: "/admin/analytics/sales",
    icon: BarChart3,
  },

  // {
  //   title: "Teachers",
  //   href: "/teachers",
  //   icon: GraduationCap,
  // },

  // {
  //   title: "Banners",
  //   href: "/banners",
  //   icon: Image,
  // },

  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: Star,
  },

  // {
  //   title: "Settings",
  //   href: "/settings",
  //   icon: Settings,
  // },

  // {
  //   title: "Audit Logs",
  //   href: "/audit-logs",
  //   icon: ScrollText,
  // },
] as const;
