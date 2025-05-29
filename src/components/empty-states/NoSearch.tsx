import { Search } from "lucide-react";
import React from "react";

import { Card, CardContent } from "../ui/card";

const NoSearch = () => {
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="flex flex-col items-center gap-4 text-center p-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <Search className="h-8 w-8 text-primary" />
        </div>
        <p className="text-muted-foreground">
          Type a keyword to search for conversations, messages, or users.
        </p>
      </CardContent>
    </Card>
  );
};

export default NoSearch;
