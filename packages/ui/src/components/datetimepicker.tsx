// components/ui/DateTimePicker.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Controller, useFormContext, Control } from "react-hook-form";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";

export interface DateTimePickerProps {
  /** the field name in your form */
  name: string;
  /** optional control if not using FormProvider */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control?: Control<any>;
}

export const DateTimePicker = React.forwardRef<
  HTMLDivElement,
  DateTimePickerProps
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ name, control: controlProp }, ref) => {
  // Attempt to use control from FormProvider or prop
  const formContext = useFormContext();
  const control = controlProp ?? formContext?.control;
  if (!control) {
    throw new Error(
      "DateTimePicker must be used within a FormProvider or be passed a control prop."
    );
  }

  // Popover open state at top-level (valid hook usage)
  const [open, setOpen] = React.useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value: date, onChange } }) => {
        // Handlers
        function selectDate(d: Date | undefined) {
          if (d) onChange(d);
        }
        function changeTime(type: "hour" | "minute", v: number) {
          if (!date) return;
          const next = new Date(date);
          if (type === "hour") next.setHours(v);
          else next.setMinutes(v);
          onChange(next);
        }

        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "MM/dd/yyyy HH:mm")
                ) : (
                  <span>MM/DD/YYYY HH:mm</span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <div className="sm:flex">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={selectDate}
                  initialFocus
                />

                <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                  {/* Hour picker */}
                  <ScrollArea className="w-64 sm:w-auto">
                    <div className="flex sm:flex-col p-2">
                      {hours.reverse().map((h) => (
                        <Button
                          key={h}
                          size="icon"
                          variant={date?.getHours() === h ? "default" : "ghost"}
                          className="sm:w-full shrink-0 aspect-square"
                          onClick={() => changeTime("hour", h)}
                        >
                          {h}
                        </Button>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="sm:hidden" />
                  </ScrollArea>

                  {/* Minute picker */}
                  <ScrollArea className="w-64 sm:w-auto">
                    <div className="flex sm:flex-col p-2">
                      {minutes.map((m) => (
                        <Button
                          key={m}
                          size="icon"
                          variant={
                            date?.getMinutes() === m ? "default" : "ghost"
                          }
                          className="sm:w-full shrink-0 aspect-square"
                          onClick={() => changeTime("minute", m)}
                        >
                          {m.toString().padStart(2, "0")}
                        </Button>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="sm:hidden" />
                  </ScrollArea>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      }}
    />
  );
});
DateTimePicker.displayName = "DateTimePicker";
