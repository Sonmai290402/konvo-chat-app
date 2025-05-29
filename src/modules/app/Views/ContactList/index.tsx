import React, { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CONTACTS } from "@/constants/contacts.constants";

import Contact from "./components/Contact";

const ContactTab = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const groupedContacts = useMemo(() => {
    const filteredContacts = CONTACTS.filter((contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups = filteredContacts.reduce((acc, contact) => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(contact);
      return acc;
    }, {} as Record<string, typeof CONTACTS>);

    return Object.keys(groups)
      .sort()
      .map((letter) => ({
        letter,
        contacts: groups[letter].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [searchQuery]);

  return (
    <div className="flex flex-col space-y-4">
      <Input
        className="w-full rounded-full"
        placeholder="Search contact by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <ScrollArea className="flex flex-col overflow-y-auto max-h-[calc(100vh-60px-36px-40px-8px)]">
        {groupedContacts.length > 0 ? (
          groupedContacts.map((group) => (
            <div key={group.letter} className="my-2">
              <h3 className="text-sm font-medium text-muted-foreground pl-2">
                {group.letter}
              </h3>
              <div className="space-y-1">
                {group.contacts.map((contact) => (
                  <Contact key={contact.id} contact={contact} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-4">
            No contacts found
          </p>
        )}
      </ScrollArea>
    </div>
  );
};

export default ContactTab;
