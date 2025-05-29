import { X } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { useViewStore } from "@/store/viewStore";

const InfoHeader = () => {
  const { setChatInfoOpen } = useViewStore();

  return (
    <div className="flex items-center justify-between border-b border-border px-4 h-[60px] bg-card">
      <h2 className="text-lg font-semibold">Conversation Info</h2>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => setChatInfoOpen(false)}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default InfoHeader;
