import React from "react";

import { Button } from "@/components/ui/button";

const ControlButtons = () => {
  return (
    <div className="space-y-2">
      <Button variant="destructive" className="w-full" size="sm">
        Block Contact
      </Button>
      <Button variant="outline" className="w-full" size="sm">
        Clear Chat History
      </Button>
    </div>
  );
};

export default ControlButtons;
