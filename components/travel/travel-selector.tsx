"use client";

import { Folder, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TravelSelectorProps = {
  travels: unknown[];
  activeTravel: unknown | null;
  onTravelChange: (travelId: string) => void;
  onCreateTravel: () => void;
};

export function TravelSelector({
  travels,
  activeTravel,
  onTravelChange,
  onCreateTravel,
}: TravelSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-sm">Travel:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Folder className="mr-2 h-4 w-4" />
            {(activeTravel as { name: string })?.name || "Select Travel"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {travels.map((travel) => (
            <DropdownMenuItem
              key={(travel as { id: string }).id}
              onClick={() => onTravelChange((travel as { id: string }).id)}
            >
              {(travel as { name: string; isActive: boolean }).name}
              {(travel as { isActive: boolean }).isActive && " (Active)"}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={onCreateTravel}>
            <Plus className="mr-2 h-4 w-4" />
            <span>New Travel</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
