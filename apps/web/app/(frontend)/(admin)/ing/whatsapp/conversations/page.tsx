"use client";

import { useTitle } from "@/components/title-provider";
import { useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { Menu } from "lucide-react";

export default function Home() {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Conversations");
  }, [setTitle]);

  return (
    <div className="flex">
      <div className="p-2 hidden md:flex">
        <ConversationMenu />
      </div>
      <div className="flex-1 p-2">
        <div className="">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="flex md:hidden mb-4"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex md:hidden">
              <div className="pt-10 px-2">
                <ConversationMenu />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="border rounded-md bg-[#ebe5de]">
          <div className="bg-[url(/whatsapp-bg.png)] bg-opacity-40 ">
            <div className="bg-muted/80 backdrop-invert backdrop-opacity-10 min-h-[90vh] p-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationMenu() {
  return (
    <div className="border min-h-[90vh] p-4 rounded-md ">
      <Tabs defaultValue="all" className="w-full md:w-80">
        <TabsList className="w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="unread">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
}
