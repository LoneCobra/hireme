import React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";

export default function MultiSelect({ options = [], value = [], onChange, placeholder = "Select…", emptyText = "No options.", testId }) {
  const [open, setOpen] = React.useState(false);
  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" data-testid={testId} className="w-full min-h-[44px] rounded-xl border border-gray-200 bg-white px-3 py-2 flex items-center justify-between gap-2 text-left hover:border-gray-300 focus:outline-none focus:border-[#2c0eee] focus:ring-2 focus:ring-[#2c0eee]/15">
          <span className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {value.length === 0 && <span className="text-sm text-gray-400">{placeholder}</span>}
            {value.map((v) => (
              <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f4f5ff] text-[#2c0eee] text-xs font-medium">
                {v}
                <X className="h-3 w-3 cursor-pointer hover:text-[#f61d25]" onClick={(e) => { e.stopPropagation(); toggle(v); }} />
              </span>
            ))}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const selected = value.includes(opt);
                return (
                  <CommandItem key={opt} value={opt} onSelect={() => toggle(opt)} className="cursor-pointer">
                    <span className={`mr-2 h-4 w-4 rounded border flex items-center justify-center ${selected ? "bg-[#2c0eee] border-[#2c0eee]" : "border-gray-300"}`}>
                      {selected && <Check className="h-3 w-3 text-white" />}
                    </span>
                    {opt}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
