"use client";

import { Input } from "@workspace/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { useQueryState } from "nuqs";
import React from "react";
import { useSearchStore } from "../_store/search-store";
import { SearchResult } from "./search-result";
import { ScrollableContacts } from "./scrollable-contact";

export default function ConversationMenu() {
  const [, setUnread] = useQueryState("unread", {
    defaultValue: "false",
    shallow: false,
  });

  const [, setContact] = useQueryState("contact", {
    defaultValue: "",
    shallow: false,
  });

  const { query, setQuery } = useSearchStore();

  return (
    <div className="p-4 rounded-md bg-background">
      <Tabs
        defaultValue="all"
        className="w-full md:w-64"
        onValueChange={(v) => {
          setUnread(v);
          setContact("");
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="false">All</TabsTrigger>
          <TabsTrigger value="true">Unread</TabsTrigger>
        </TabsList>

        <Input
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {query ? (
          <>
            <SearchResult />
          </>
        ) : (
          <div>
            <ScrollableContacts />
          </div>
        )}
      </Tabs>
    </div>
  );
}
