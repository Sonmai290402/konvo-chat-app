import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ContactProps {
  contact: {
    id: number;
    name: string;
    email: string;
    avatar: string;
  };
}

const Contact = ({ contact }: ContactProps) => {
  return (
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
      <Avatar className="size-10">
        <AvatarImage src={contact.avatar} alt={contact.name} />
        <AvatarFallback>
          {contact.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{contact.name}</p>
        <p className="text-xs text-muted-foreground">{contact.email}</p>
      </div>
    </div>
  );
};

export default Contact;
