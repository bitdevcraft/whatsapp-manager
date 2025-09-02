"use client";

import { Input } from "@workspace/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { useQueryState } from "nuqs";
import React from "react";

import { useSearchStore } from "../_store/search-store";
import { ScrollableContacts } from "./scrollable-contact";
import { SearchResult } from "./search-result";

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
        className="w-full md:w-64"
        defaultValue="all"
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
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          value={query}
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
