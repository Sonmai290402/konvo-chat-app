import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useViewStore, ViewType } from "@/store/viewStore";

export const useViewNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { activeView, setActiveView } = useViewStore();

  useEffect(() => {
    if (pathname.includes("chat")) {
      setActiveView("chat");
    } else if (pathname === "/") {
      // Root path should redirect to chat, so set chat as active view
      setActiveView("chat");
    } else if (pathname.includes("contacts")) {
      setActiveView("contacts");
    } else if (pathname.includes("search")) {
      setActiveView("search");
    } else if (pathname.includes("user")) {
      setActiveView("user");
    }
  }, [pathname, setActiveView]);

  // Navigate to another view
  const navigateTo = (view: ViewType) => {
    setActiveView(view);

    switch (view) {
      case "chat":
        router.push("/chat");
        break;
      case "contacts":
        router.push("/contacts");
        break;
      case "search":
        router.push("/search");
        break;
      case "user":
        router.push("/user");
        break;
      default:
        router.push("/chat");
        break;
    }
  };

  return {
    activeView,
    navigateTo,
  };
};
