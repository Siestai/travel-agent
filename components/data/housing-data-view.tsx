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
import { Textarea } from "@/components/ui/textarea";
import type { HousingDocument } from "@/lib/parser/schemas";

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

export function HousingDataView({
  data,
  isEditing,
  onChange,
}: {
  data: Record<string, unknown>;
  isEditing: boolean;
  onChange: (data: Record<string, unknown>) => void;
}) {
  const housingData = data as HousingDocument;

  if (isEditing) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="propertyName">Property Name</Label>
          <Input
            id="propertyName"
            onChange={(e) =>
              onChange({ ...data, propertyName: e.target.value })
            }
            value={housingData.propertyName || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendorName">Vendor Name</Label>
          <Input
            id="vendorName"
            onChange={(e) => onChange({ ...data, vendorName: e.target.value })}
            value={housingData.vendorName || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="propertyAddress">Property Address</Label>
          <Textarea
            id="propertyAddress"
            onChange={(e) =>
              onChange({ ...data, propertyAddress: e.target.value })
            }
            value={housingData.propertyAddress || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="roomType">Room Type</Label>
          <Input
            id="roomType"
            onChange={(e) => onChange({ ...data, roomType: e.target.value })}
            value={housingData.roomType || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkInDate">Check In Date</Label>
          <Input
            id="checkInDate"
            onChange={(e) => onChange({ ...data, checkInDate: e.target.value })}
            type="date"
            value={housingData.checkInDate || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkOutDate">Check Out Date</Label>
          <Input
            id="checkOutDate"
            onChange={(e) =>
              onChange({ ...data, checkOutDate: e.target.value })
            }
            type="date"
            value={housingData.checkOutDate || ""}
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
            value={housingData.totalAmount || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numberOfGuests">Number of Guests</Label>
          <Input
            id="numberOfGuests"
            onChange={(e) =>
              onChange({
                ...data,
                numberOfGuests: Number.parseInt(e.target.value, 10),
              })
            }
            type="number"
            value={housingData.numberOfGuests || ""}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {housingData.propertyName && (
        <Card>
          <CardHeader>
            <CardTitle>Property Name</CardTitle>
          </CardHeader>
          <CardContent>{housingData.propertyName}</CardContent>
        </Card>
      )}
      {housingData.vendorName && (
        <Card>
          <CardHeader>
            <CardTitle>Vendor</CardTitle>
          </CardHeader>
          <CardContent>{housingData.vendorName}</CardContent>
        </Card>
      )}
      {housingData.propertyAddress && (
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>{housingData.propertyAddress}</CardContent>
        </Card>
      )}
      {housingData.roomType && (
        <Card>
          <CardHeader>
            <CardTitle>Room Type</CardTitle>
          </CardHeader>
          <CardContent>{housingData.roomType}</CardContent>
        </Card>
      )}
      {housingData.checkInDate && (
        <Card>
          <CardHeader>
            <CardTitle>Check In</CardTitle>
          </CardHeader>
          <CardContent>{housingData.checkInDate}</CardContent>
        </Card>
      )}
      {housingData.checkOutDate && (
        <Card>
          <CardHeader>
            <CardTitle>Check Out</CardTitle>
          </CardHeader>
          <CardContent>{housingData.checkOutDate}</CardContent>
        </Card>
      )}
      {housingData.totalAmount && (
        <Card>
          <CardHeader>
            <CardTitle>Total Amount</CardTitle>
            <CardDescription>{housingData.currency || "USD"}</CardDescription>
          </CardHeader>
          <CardContent>
            {getCurrencySymbol(housingData.currency as string | undefined)}
            {housingData.totalAmount}
          </CardContent>
        </Card>
      )}
      {housingData.numberOfGuests && (
        <Card>
          <CardHeader>
            <CardTitle>Guests</CardTitle>
          </CardHeader>
          <CardContent>{housingData.numberOfGuests} guests</CardContent>
        </Card>
      )}
    </div>
  );
}
