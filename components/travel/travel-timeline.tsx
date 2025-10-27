"use client";

import { Calendar, Clock, MapPin } from "lucide-react";
import { useMemo } from "react";
import type { TravelConnection } from "@/lib/types/travel";

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

type TravelTimelineProps = {
  nodes: TravelNode[];
  connections: TravelConnection[];
};

type TimelineItem = {
  id: string;
  node: TravelNode;
  connection?: TravelConnection;
  date: Date;
  type: "arrival" | "departure" | "checkin" | "checkout";
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

const getConnectionEmoji = (type: string): string => {
  return emojiMap[type] || "🔗";
};

const getConnectionLabel = (type: string): string => {
  const labels: Record<string, string> = {
    flight: "Flying",
    train: "Train ride",
    bus: "Bus ride",
    ferry: "Ferry",
    car: "Drive",
  };
  return labels[type] || type;
};

const YEAR_REGEX = /\d{4}/;
const DATE_FORMAT_REGEX =
  /(\d{1,2}):(\d{2}),\s*(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i;

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    airport: "bg-blue-100 text-blue-700 border-blue-300",
    station: "bg-purple-100 text-purple-700 border-purple-300",
    accommodation: "bg-green-100 text-green-700 border-green-300",
    destination: "bg-orange-100 text-orange-700 border-orange-300",
  };
  return colors[type] || "bg-gray-100 text-gray-700 border-gray-300";
}

export function TravelTimeline({ nodes, connections }: TravelTimelineProps) {
  // Track the boundary between valid and invalid items
  const { timelineItems, validCount } = useMemo(() => {
    const allItems: TimelineItem[] = [];

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

    // Determine the year context (use most common year from references, or current year)
    const sortedYears = Array.from(referenceYears).sort();
    const yearContext =
      sortedYears.length > 0
        ? sortedYears.at(-1) || new Date().getFullYear()
        : new Date().getFullYear();

    const createTimelineItem = (
      travelNode: TravelNode,
      dateString: string | undefined,
      type: "checkin" | "checkout" | "arrival" | "departure",
      itemId: string
    ) => {
      let date: Date;

      if (!dateString || dateString.trim() === "") {
        // Use distant future date for items without dates
        date = new Date("2099-12-31");
      } else {
        // Try multiple date parsing strategies
        date = new Date(dateString);

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
          } else {
            // Last resort: extract year from string
            const yearMatch = dateString.match(YEAR_REGEX);
            if (yearMatch) {
              const year = Number.parseInt(yearMatch[0], 10);
              if (year >= 2020 && year <= 2030) {
                // Try to parse with the extracted year
                const tempDate = new Date(dateString);
                if (!Number.isNaN(tempDate.getTime())) {
                  tempDate.setFullYear(year);
                  date = tempDate;
                }
              }
            }
          }
        }

        // If date parsed to year 2001 or earlier (likely missing year in original)
        // Use the year context to infer the correct year
        if (!Number.isNaN(date.getTime()) && date.getFullYear() < 2020) {
          // Check if the original dateString contains a valid year that wasn't parsed
          const yearMatch = dateString.match(YEAR_REGEX);
          if (yearMatch) {
            const year = Number.parseInt(yearMatch[0], 10);
            if (year >= 2020 && year <= 2030) {
              date.setFullYear(year);
            } else if (sortedYears.length > 0) {
              // Use context year
              date.setFullYear(yearContext);
            } else {
              // Default logic
              const currentYear = new Date().getFullYear();
              if (date.getFullYear() === 2001) {
                date.setFullYear(2026);
              } else if (date.getMonth() <= 2) {
                date.setFullYear(currentYear + 1);
              } else {
                date.setFullYear(currentYear);
              }
            }
          } else if (sortedYears.length > 0) {
            // No year in string, use context
            date.setFullYear(yearContext);
          } else {
            // No context, infer year
            const currentYear = new Date().getFullYear();
            if (date.getFullYear() === 2001) {
              date.setFullYear(2026);
            } else if (date.getMonth() <= 2) {
              date.setFullYear(currentYear + 1);
            } else {
              date.setFullYear(currentYear);
            }
          }
        }

        if (Number.isNaN(date.getTime())) {
          // Use distant future date for invalid dates
          date = new Date("2099-12-31");
        }
      }

      allItems.push({
        id: itemId,
        node: travelNode,
        date,
        type,
      });
    };
    let itemCount = 0;
    for (const node of nodes) {
      // Only create timeline items for fields that actually exist
      // Accommodation nodes should only have check-in/check-out
      // Transportation nodes should only have arrival/departure

      if (node.checkIn || node.checkOut) {
        // This is an accommodation node
        if (node.checkIn) {
          createTimelineItem(
            node,
            node.checkIn,
            "checkin",
            `${node.id}_checkin`
          );
          itemCount++;
        }
        if (node.checkOut) {
          createTimelineItem(
            node,
            node.checkOut,
            "checkout",
            `${node.id}_checkout`
          );
          itemCount++;
        }
      } else {
        // This is a transportation node
        if (node.arrivalTime) {
          createTimelineItem(
            node,
            node.arrivalTime,
            "arrival",
            `${node.id}_arrival`
          );
          itemCount++;
        }
        if (node.departureTime) {
          createTimelineItem(
            node,
            node.departureTime,
            "departure",
            `${node.id}_departure`
          );
          itemCount++;
        }
      }
    }

    // Sort ALL items by date (ascending) - items with date 2099-12-31 will be at the end
    allItems.sort((a, b) => {
      return a.date.getTime() - b.date.getTime();
    });
    return {
      timelineItems: allItems,
      validCount: itemCount,
    };
  }, [nodes]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, TravelNode>();
    for (const node of nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [nodes]);

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventLabel = (item: TimelineItem): string => {
    switch (item.type) {
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

  const getConnectionsForNode = (nodeId: string) => {
    return connections.filter(
      (conn) => conn.from === nodeId || conn.to === nodeId
    );
  };

  if (timelineItems.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <div className="text-center">
          <p className="mb-2 text-5xl">📅</p>
          <p className="font-medium text-lg">No timeline events found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-y-auto bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto w-full max-w-3xl px-6 py-8">
        {/* Timeline container */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute top-0 left-8 h-full w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

          {/* Timeline items */}
          <div className="space-y-12">
            {timelineItems.map((item, index) => {
              const nodeConnections = getConnectionsForNode(item.node.id);
              const isInvalidDate =
                item.date.getTime() === new Date("2099-12-31").getTime();
              const isPast = !isInvalidDate && item.date < new Date();
              const nextItem = timelineItems[index + 1];
              const isNextValid =
                nextItem && !Number.isNaN(nextItem.date.getTime());
              const hoursBetween =
                !isInvalidDate && isNextValid
                  ? Math.ceil(
                      (nextItem.date.getTime() - item.date.getTime()) /
                        (1000 * 60 * 60)
                    )
                  : 0;

              // Show separator when transitioning from valid to invalid items
              const showSeparator = index === validCount && index > 0;

              return (
                <div key={item.id}>
                  {showSeparator && (
                    <div className="mt-8 mb-8 border-muted border-t-2 border-dashed">
                      <div className="flex items-center justify-center py-4">
                        <span className="rounded-full bg-muted px-4 py-1 font-semibold text-muted-foreground text-xs">
                          📅 Dates to be confirmed
                        </span>
                      </div>
                    </div>
                  )}
                  <div
                    className={`relative flex items-start gap-6 ${
                      isInvalidDate ? "opacity-40" : ""
                    }`}
                    style={{
                      animation: `slideInLeft 0.6s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    {/* Date circle */}
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-full border-4 bg-background shadow-lg transition-all hover:scale-110 ${
                          isPast
                            ? "border-primary/50"
                            : "animate-pulse border-primary"
                        }`}
                      >
                        <span className="text-2xl">
                          {getNodeEmoji(item.node.type)}
                        </span>
                      </div>
                      {nodeConnections.length > 0 && (
                        <div className="-bottom-2 -translate-x-1/2 absolute left-1/2 rounded-full border-2 border-background bg-accent px-2 py-0.5 font-semibold text-xs">
                          {getConnectionEmoji(nodeConnections[0].type)}
                        </div>
                      )}
                    </div>

                    {/* Content card */}
                    <div className="flex-1 pt-2 pb-8">
                      <div
                        className={`group rounded-lg border-2 p-5 shadow-sm transition-all hover:shadow-md ${
                          isPast
                            ? "bg-card"
                            : "border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10"
                        }`}
                      >
                        {/* Header */}
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 font-semibold text-xs ${getTypeColor(
                                item.node.type
                              )}`}
                            >
                              {item.node.name}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {getEventLabel(item)}
                            </span>
                          </div>
                        </div>

                        {/* Date and time */}
                        <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">
                              {isInvalidDate
                                ? "Date TBD"
                                : formatDateTime(item.date)}
                            </span>
                          </div>

                          {/* Additional info based on type */}
                          {(item.type === "checkin" ||
                            item.type === "checkout") &&
                            item.node.checkIn &&
                            item.node.checkOut && (
                              <div className="mb-2 flex items-center gap-2 text-muted-foreground text-sm">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {Math.ceil(
                                    (new Date(item.node.checkOut).getTime() -
                                      new Date(item.node.checkIn).getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  )}{" "}
                                  nights
                                </span>
                              </div>
                            )}

                          {/* Address */}
                          {item.node.address && (
                            <div className="mb-3 flex items-start gap-2 text-muted-foreground text-sm">
                              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                              <span>{item.node.address}</span>
                            </div>
                          )}

                          {/* Connections */}
                          {nodeConnections.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {nodeConnections.map((conn) => {
                                const fromNode = nodeMap.get(conn.from);
                                const toNode = nodeMap.get(conn.to);
                                if (!fromNode || !toNode) {
                                  return null;
                                }

                                return (
                                  <div
                                    className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm"
                                    key={conn.id}
                                  >
                                    <span className="text-base">
                                      {getConnectionEmoji(conn.type)}
                                    </span>
                                    <span className="font-medium">
                                      {getConnectionLabel(conn.type)}
                                    </span>
                                    {conn.carrier && (
                                      <span className="text-muted-foreground">
                                        with {conn.carrier}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Connection line to next item */}
                        {index < timelineItems.length - 1 && (
                          <div className="ml-[-2.5rem] flex items-center gap-2">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-muted-foreground text-xs">
                              ⏱️ {hoursBetween > 0 ? `${hoursBetween}h` : ""}
                            </span>
                            <div className="h-px flex-1 bg-border" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add CSS animation */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
