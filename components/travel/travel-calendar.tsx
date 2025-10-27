"use client";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TravelNode = {
  id: string;
  name: string;
  type: string;
  coordinates?: { lat: number; lng: number };
  address?: string;
  checkIn?: string;
  checkOut?: string;
  documentId: string;
  documentTitle: string;
  driveFileId: string;
  departureTime?: string;
  arrivalTime?: string;
};

type TravelCalendarProps = {
  nodes: TravelNode[];
};

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: "checkin" | "checkout" | "arrival" | "departure";
  node: TravelNode;
  driveFileId: string;
};

const emojiMap: Record<string, string> = {
  airport: "✈️",
  station: "🚂",
  accommodation: "🏨",
  destination: "📍",
  flight: "🛫",
  train: "🚆",
  bus: "🚌",
  ferry: "⛴️",
  car: "🚗",
};

const getNodeEmoji = (type: string): string => {
  return emojiMap[type] || "📍";
};

const getEventLabel = (
  type: "checkin" | "checkout" | "arrival" | "departure"
): string => {
  switch (type) {
    case "checkin":
      return "Check-in";
    case "checkout":
      return "Check-out";
    case "arrival":
      return "Arrival";
    case "departure":
      return "Departure";
    default:
      return "";
  }
};

const YEAR_REGEX = /\d{4}/;
const DATE_FORMAT_REGEX =
  /(\d{1,2}):(\d{2}),\s*(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i;

function parseDate(dateString: string | undefined, yearContext: number): Date {
  if (!dateString || dateString.trim() === "") {
    // Use distant future date for items without dates
    return new Date("2099-12-31");
  }

  let date = new Date(dateString);

  // If parsing failed, try with Date.parse
  if (Number.isNaN(date.getTime())) {
    const parsed = Date.parse(dateString);
    if (!Number.isNaN(parsed)) {
      date = new Date(parsed);
    }
  }

  // If still invalid, try extracting components manually
  if (Number.isNaN(date.getTime())) {
    // Try parsing "HH:MM, DD MMM YYYY" format
    const match = dateString.match(DATE_FORMAT_REGEX);
    if (match) {
      const monthMap: Record<string, number> = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };
      const year = Number.parseInt(match[5], 10);
      const month = monthMap[match[4].toLowerCase()];
      const day = Number.parseInt(match[3], 10);
      const hour = Number.parseInt(match[1], 10);
      const minute = Number.parseInt(match[2], 10);

      date = new Date(year, month, day, hour, minute);
    }
  }

  // If date parsed to year 2001 or earlier (likely missing year in original)
  // Use the year context to infer the correct year
  if (!Number.isNaN(date.getTime()) && date.getFullYear() < 2020) {
    const yearMatch = dateString.match(YEAR_REGEX);
    if (yearMatch) {
      const year = Number.parseInt(yearMatch[0], 10);
      if (year >= 2020 && year <= 2030) {
        date.setFullYear(year);
      } else if (yearContext) {
        date.setFullYear(yearContext);
      }
    } else if (yearContext) {
      date.setFullYear(yearContext);
    }
  }

  if (Number.isNaN(date.getTime())) {
    // Use distant future date for invalid dates
    return new Date("2099-12-31");
  }

  return date;
}

export function TravelCalendar({ nodes }: TravelCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Parse events from nodes
  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    // First pass: find reference years from ALL nodes
    const referenceYears = new Set<number>();
    for (const node of nodes) {
      const datesToCheck = [
        node.departureTime,
        node.arrivalTime,
        node.checkIn,
        node.checkOut,
      ];
      for (const dateStr of datesToCheck) {
        if (dateStr && dateStr.trim() !== "") {
          const parsedDate = new Date(dateStr);
          if (
            !Number.isNaN(parsedDate.getTime()) &&
            parsedDate.getFullYear() >= 2020
          ) {
            referenceYears.add(parsedDate.getFullYear());
          }
        }
      }
    }

    // Determine the year context
    const sortedYears = Array.from(referenceYears).sort();
    const yearContext =
      sortedYears.length > 0
        ? sortedYears.at(-1) || new Date().getFullYear()
        : new Date().getFullYear();

    for (const node of nodes) {
      if (node.checkIn || node.checkOut) {
        // Accommodation node
        if (node.checkIn) {
          const date = parseDate(node.checkIn, yearContext);
          if (
            date.getFullYear() >= 2020 &&
            date.getTime() !== new Date("2099-12-31").getTime()
          ) {
            allEvents.push({
              id: `${node.id}_checkin`,
              title: `${getNodeEmoji(node.type)} ${node.name}`,
              date,
              type: "checkin",
              node,
              driveFileId: node.driveFileId,
            });
          }
        }
        if (node.checkOut) {
          const date = parseDate(node.checkOut, yearContext);
          if (
            date.getFullYear() >= 2020 &&
            date.getTime() !== new Date("2099-12-31").getTime()
          ) {
            allEvents.push({
              id: `${node.id}_checkout`,
              title: `${getNodeEmoji(node.type)} ${node.name}`,
              date,
              type: "checkout",
              node,
              driveFileId: node.driveFileId,
            });
          }
        }
      } else if (node.departureTime || node.arrivalTime) {
        // Transportation node
        if (node.departureTime) {
          const date = parseDate(node.departureTime, yearContext);
          if (
            date.getFullYear() >= 2020 &&
            date.getTime() !== new Date("2099-12-31").getTime()
          ) {
            allEvents.push({
              id: `${node.id}_departure`,
              title: `${getNodeEmoji(node.type)} ${node.name}`,
              date,
              type: "departure",
              node,
              driveFileId: node.driveFileId,
            });
          }
        }
        if (node.arrivalTime) {
          const date = parseDate(node.arrivalTime, yearContext);
          if (
            date.getFullYear() >= 2020 &&
            date.getTime() !== new Date("2099-12-31").getTime()
          ) {
            allEvents.push({
              id: `${node.id}_arrival`,
              title: `${getNodeEmoji(node.type)} ${node.name}`,
              date,
              type: "arrival",
              node,
              driveFileId: node.driveFileId,
            });
          }
        }
      }
    }

    return allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [nodes]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Find the oldest event (first chronologically)
  const oldestEventDate = events.length > 0 ? events[0].date : null;
  // Find the newest event (last chronologically)
  const newestEventDate =
    events.length > 0 ? (events.at(-1)?.date ?? null) : null;

  // Get events for a specific date
  const getEventsForDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return events.filter((event) => {
      return (
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
      );
    });
  };

  // Check if this date contains the oldest event
  const isOldestEvent = (day: number) => {
    if (!oldestEventDate) {
      return false;
    }
    const date = new Date(currentYear, currentMonth, day);
    return (
      date.getDate() === oldestEventDate.getDate() &&
      date.getMonth() === oldestEventDate.getMonth() &&
      date.getFullYear() === oldestEventDate.getFullYear()
    );
  };

  // Check if this date contains the newest event
  const isNewestEvent = (day: number) => {
    if (!newestEventDate) {
      return false;
    }
    const date = new Date(currentYear, currentMonth, day);
    return (
      date.getDate() === newestEventDate.getDate() &&
      date.getMonth() === newestEventDate.getMonth() &&
      date.getFullYear() === newestEventDate.getFullYear()
    );
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToStartDate = () => {
    if (oldestEventDate) {
      setCurrentDate(
        new Date(oldestEventDate.getFullYear(), oldestEventDate.getMonth(), 1)
      );
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const goToEndDate = () => {
    if (newestEventDate) {
      setCurrentDate(
        new Date(newestEventDate.getFullYear(), newestEventDate.getMonth(), 1)
      );
    }
  };

  const hasEvents = events.length > 0;

  // Calculate time until start of holiday
  const timeUntilStart = useMemo(() => {
    if (!oldestEventDate) {
      return null;
    }
    const now = new Date();
    const startDate = new Date(oldestEventDate);
    const diffTime = startDate.getTime() - now.getTime();

    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    const hours = diffHours % 24;
    const minutes = diffMinutes % 60;

    return { days: diffDays, hours, minutes, isPast: diffTime < 0 };
  }, [oldestEventDate]);

  // Get the first event for modal display
  const firstEvent = events.length > 0 ? events[0] : null;

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto w-full max-w-5xl p-6">
        {/* Calendar Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              className="h-9 w-9"
              onClick={previousMonth}
              size="icon"
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold text-xl">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <Button
              className="h-9 w-9"
              onClick={nextMonth}
              size="icon"
              variant="outline"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {hasEvents &&
              oldestEventDate &&
              firstEvent &&
              timeUntilStart !== null && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="h-9 gap-2"
                      size="sm"
                      title={
                        timeUntilStart.isPast
                          ? "Holiday has started"
                          : timeUntilStart.days > 0
                            ? `${timeUntilStart.days}d ${timeUntilStart.hours}h ${timeUntilStart.minutes}m until start`
                            : timeUntilStart.hours > 0
                              ? `${timeUntilStart.hours}h ${timeUntilStart.minutes}m until start`
                              : `${timeUntilStart.minutes}m until start`
                      }
                      variant="outline"
                    >
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold text-sm">
                        {timeUntilStart.isPast
                          ? `${Math.abs(timeUntilStart.days)}d ago`
                          : timeUntilStart.days > 0
                            ? `${timeUntilStart.days}d ${timeUntilStart.hours}h`
                            : timeUntilStart.hours > 0
                              ? `${timeUntilStart.hours}h ${timeUntilStart.minutes}m`
                              : `${timeUntilStart.minutes}m`}
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogTitle className="sr-only">
                      Holiday Start Information
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      View your holiday start date and first event details
                    </DialogDescription>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                          <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            Holiday starts
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {oldestEventDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-2xl">
                            {getNodeEmoji(firstEvent.node.type)}
                          </span>
                          <span className="font-semibold">
                            {firstEvent.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <MapPin className="h-4 w-4" />
                          <span>{firstEvent.node.address}</span>
                        </div>
                      </div>
                      {firstEvent.node.coordinates && (
                        <div className="text-center text-muted-foreground text-xs">
                          {timeUntilStart.isPast
                            ? "Your holiday has started"
                            : timeUntilStart.days > 0
                              ? `${timeUntilStart.days} days, ${timeUntilStart.hours} hours, and ${timeUntilStart.minutes} minutes remaining`
                              : timeUntilStart.hours > 0
                                ? `${timeUntilStart.hours} hours and ${timeUntilStart.minutes} minutes remaining`
                                : `${timeUntilStart.minutes} minutes remaining`}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            {hasEvents && oldestEventDate && newestEventDate && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="h-9 w-9" size="icon" variant="outline">
                    <Navigation className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={goToStartDate}>
                    <MapPin className="mr-2 h-4 w-4 text-green-500" />
                    <span>Go to start</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={goToToday}>
                    <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Go to today</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={goToEndDate}>
                    <MapPin className="mr-2 h-4 w-4 text-red-500" />
                    <span>Go to end</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {dayNames.map((day) => (
            <div
              className="pb-2 text-center font-semibold text-muted-foreground text-sm"
              key={day}
            >
              {day}
            </div>
          ))}

          {/* Empty cells for days before the first day of the month */}
          {Array.from({ length: startingDayOfWeek }).map((_, dayOffset) => {
            const emptyCellId = `${currentYear}-${currentMonth}-empty-${dayOffset}`;
            return <div className="min-h-[80px]" key={emptyCellId} />;
          })}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDate(day);
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === currentMonth &&
              new Date().getFullYear() === currentYear;
            const isOldest = isOldestEvent(day);
            const isNewest = isNewestEvent(day);

            return (
              <div
                className={`min-h-[80px] rounded-lg border-2 p-2 transition-colors ${
                  isOldest
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : isNewest
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : isToday
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                }`}
                key={day}
              >
                <div className="mb-1 flex items-center justify-between font-medium text-muted-foreground text-sm">
                  <span>{day}</span>
                  {isOldest && (
                    <span className="rounded-full bg-green-500 px-1.5 font-bold text-white text-xs">
                      Start
                    </span>
                  )}
                  {isNewest && (
                    <span className="rounded-full bg-blue-500 px-1.5 font-bold text-white text-xs">
                      End
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <Link
                      className="block truncate rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary text-xs transition-colors hover:bg-primary/20"
                      href={`/parsed/${event.driveFileId}`}
                      key={event.id}
                      title={`${event.title} - ${getEventLabel(event.type)}`}
                    >
                      {event.title}
                    </Link>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-center text-muted-foreground text-xs">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
