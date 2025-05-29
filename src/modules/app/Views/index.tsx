import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useViewNavigation } from "@/hooks/useViewNavigation";

import ContactsView from "./ContactList";
import ConversationList from "./ConversationList";
import ProfileHeader from "./ProfileHeader";
import SearchView from "./Search";

const Views = () => {
  const { activeView } = useViewNavigation();

  const renderView = () => {
    switch (activeView) {
      case "chat":
        return <ConversationList />;
      case "contacts":
        return <ContactsView />;
      case "search":
        return <SearchView />;
      case "user":
        return <SearchView />;
      default:
        return <ConversationList />;
    }
  };

  return (
    <div className="flex flex-col border-r border-border">
      <ProfileHeader />
      <Card className="m-2 h-full max-h-[calc(100vh-60px-16px)]">
        <CardContent className="px-4">{renderView()}</CardContent>
      </Card>
    </div>
  );
};

export default Views;
