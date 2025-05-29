import { Contact, Loader2, LogOut, MessageSquare, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

import { useViewNavigation } from "@/hooks/useViewNavigation";
import { useAuthStore } from "@/store/authStore";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

const SideBar = () => {
  const { logOut, loading } = useAuthStore();
  const { navigateTo } = useViewNavigation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logOut();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-sidebar h-full border-r border-sidebar-border">
      <div className="h-[60px] flex items-center justify-center">
        <Link href="/chat">
          <Image
            src="/konvo-logo.png"
            alt="Konvo Logo"
            width={40}
            height={40}
            className="h-12 w-12"
          />
        </Link>
      </div>
      <div className="flex flex-col items-center gap-4 py-4">
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full relative hover:bg-primary/10 ${
            pathname === "/" || pathname.startsWith("/chat")
              ? "bg-primary/20"
              : ""
          }`}
          onClick={() => navigateTo("chat")}
        >
          <MessageSquare className="size-5" />
          <span className="sr-only">Conversations</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full relative hover:bg-primary/10 ${
            pathname === "/contacts" ? "bg-primary/20" : ""
          }`}
          onClick={() => navigateTo("contacts")}
        >
          <Contact className="size-5" />
          <span className="sr-only">Contacts</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full relative hover:bg-primary/10 ${
            pathname === "/search" ? "bg-primary/20" : ""
          }`}
          onClick={() => navigateTo("search")}
        >
          <Search className="size-5" />
          <span className="sr-only">Search</span>
        </Button>

        <AlertDialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative hover:bg-primary/10"
              disabled={isLoggingOut || loading}
            >
              {isLoggingOut ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <LogOut className="size-5" />
              )}
              <span className="sr-only">Log Out</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Log Out</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to log out?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-destructive"
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SideBar;
