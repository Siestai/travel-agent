"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TransportationDocument } from "@/lib/parser/schemas";

const getCurrencySymbol = (currency?: string): string => {
  const currencyMap: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
    INR: "₹",
    KRW: "₩",
    THB: "฿",
    SGD: "S$",
    MYR: "RM",
    IDR: "Rp",
    PHP: "₱",
    VND: "₫",
    AUD: "A$",
    CAD: "C$",
    NZD: "NZ$",
    HKD: "HK$",
    CHF: "CHF",
    MXN: "$",
    BRL: "R$",
    ZAR: "R",
    AED: "د.إ",
    SAR: "﷼",
    TRY: "₺",
    RUB: "₽",
    PLN: "zł",
    CZK: "Kč",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
  };
  return currencyMap[currency?.toUpperCase() || ""] || "$";
};

export function TransportationDataView({
  data,
  isEditing,
  onChange,
}: {
  data: Record<string, unknown>;
  isEditing: boolean;
  onChange: (data: Record<string, unknown>) => void;
}) {
  const transportationData = data as TransportationDocument;

  if (isEditing) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="transportationType">Transportation Type</Label>
          <Select
            onValueChange={(value) =>
              onChange({
                ...data,
                transportationType:
                  value as TransportationDocument["transportationType"],
              })
            }
            value={transportationData.transportationType || ""}
          >
            <SelectTrigger id="transportationType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flight">Flight</SelectItem>
              <SelectItem value="train">Train</SelectItem>
              <SelectItem value="bus">Bus</SelectItem>
              <SelectItem value="car_rental">Car Rental</SelectItem>
              <SelectItem value="taxi">Taxi</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="carrierName">Carrier Name</Label>
          <Input
            id="carrierName"
            onChange={(e) => onChange({ ...data, carrierName: e.target.value })}
            value={transportationData.carrierName || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="departureLocation">From</Label>
          <Input
            id="departureLocation"
            onChange={(e) =>
              onChange({ ...data, departureLocation: e.target.value })
            }
            value={transportationData.departureLocation || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrivalLocation">To</Label>
          <Input
            id="arrivalLocation"
            onChange={(e) =>
              onChange({ ...data, arrivalLocation: e.target.value })
            }
            value={transportationData.arrivalLocation || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="departureDateTime">Departure Date/Time</Label>
          <Input
            id="departureDateTime"
            onChange={(e) =>
              onChange({ ...data, departureDateTime: e.target.value })
            }
            type="datetime-local"
            value={transportationData.departureDateTime || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrivalDateTime">Arrival Date/Time</Label>
          <Input
            id="arrivalDateTime"
            onChange={(e) =>
              onChange({ ...data, arrivalDateTime: e.target.value })
            }
            type="datetime-local"
            value={transportationData.arrivalDateTime || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="flightNumber">Flight/Train Number</Label>
          <Input
            id="flightNumber"
            onChange={(e) =>
              onChange({ ...data, flightNumber: e.target.value })
            }
            value={transportationData.flightNumber || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalAmount">Total Amount</Label>
          <Input
            id="totalAmount"
            onChange={(e) =>
              onChange({
                ...data,
                totalAmount: Number.parseFloat(e.target.value),
              })
            }
            type="number"
            value={transportationData.totalAmount || ""}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {transportationData.transportationType && (
        <Card>
          <CardHeader>
            <CardTitle>Type</CardTitle>
          </CardHeader>
          <CardContent className="capitalize">
            {transportationData.transportationType.replace("_", " ")}
          </CardContent>
        </Card>
      )}
      {transportationData.carrierName && (
        <Card>
          <CardHeader>
            <CardTitle>Carrier</CardTitle>
          </CardHeader>
          <CardContent>{transportationData.carrierName}</CardContent>
        </Card>
      )}
      {transportationData.departureLocation && (
        <Card>
          <CardHeader>
            <CardTitle>From</CardTitle>
          </CardHeader>
          <CardContent>{transportationData.departureLocation}</CardContent>
        </Card>
      )}
      {transportationData.arrivalLocation && (
        <Card>
          <CardHeader>
            <CardTitle>To</CardTitle>
          </CardHeader>
          <CardContent>{transportationData.arrivalLocation}</CardContent>
        </Card>
      )}
      {transportationData.departureDateTime && (
        <Card>
          <CardHeader>
            <CardTitle>Departure</CardTitle>
          </CardHeader>
          <CardContent>{transportationData.departureDateTime}</CardContent>
        </Card>
      )}
      {transportationData.arrivalDateTime && (
        <Card>
          <CardHeader>
            <CardTitle>Arrival</CardTitle>
          </CardHeader>
          <CardContent>{transportationData.arrivalDateTime}</CardContent>
        </Card>
      )}
      {transportationData.flightNumber && (
        <Card>
          <CardHeader>
            <CardTitle>Flight/Train Number</CardTitle>
          </CardHeader>
          <CardContent>{transportationData.flightNumber}</CardContent>
        </Card>
      )}
      {transportationData.totalAmount && (
        <Card>
          <CardHeader>
            <CardTitle>Total Amount</CardTitle>
            <CardDescription>
              {transportationData.currency || "USD"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getCurrencySymbol(
              transportationData.currency as string | undefined
            )}
            {transportationData.totalAmount}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
