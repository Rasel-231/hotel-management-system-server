import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import prisma from "./prisma.client";

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },

  hotelTitle: {
    fontSize: 24,
    textAlign: "center",
    color: "#1e3a8a",
    fontWeight: "bold",
    marginBottom: 6,
  },
  headerInfo: {
    fontSize: 9,
    textAlign: "center",
    color: "#4b5563",
    marginBottom: 2,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    marginVertical: 15,
  },

  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 4,
  },
  receiptHeading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e3a8a",
    textAlign: "right",
  },

  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 80, color: "#4b5563" },
  value: { fontWeight: "500" },
  metaLabel: { width: 85, color: "#1e3a8a", fontWeight: "bold" },
  metaValue: { fontWeight: "500" },

  table: { width: "100%", marginBottom: 15 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e3a8a",
    color: "#ffffff",
    padding: 6,
    fontWeight: "bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 8,
    fontSize: 9,
  },
  colQty: { width: "15%" },
  colDesc: { width: "45%" },
  colPrice: { width: "20%", textAlign: "right" },
  colAmount: { width: "20%", textAlign: "right" },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 4,
    paddingRight: 8,
    fontSize: 9,
  },
  summaryLabel: {
    width: 100,
    textAlign: "right",
    color: "#4b5563",
    paddingRight: 15,
  },
  summaryValue: { width: 80, textAlign: "right", fontWeight: "500" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "#1e3a8a",
    color: "#ffffff",
    padding: 8,
    marginTop: 5,
  },
  totalLabel: {
    width: 100,
    textAlign: "right",
    fontWeight: "bold",
    paddingRight: 15,
  },
  totalValue: { width: 80, textAlign: "right", fontWeight: "bold" },

  // Footer / Notes
  taxNote: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 4,
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 4,
  },
  notesText: { fontSize: 9, color: "#4b5563" },
});

const InvoiceDoc = ({ booking, hotel, user }: any) => {
  const nights = booking?.nightsCount || 1;
  const roomPrice = booking?.room?.pricePerNight || 0;
  const subtotal = nights * roomPrice;
  const tax = subtotal * 0.075;
  const total = subtotal + tax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.hotelTitle}>
          {hotel?.name ?? "Villa Contentezza"}
        </Text>
        <Text style={styles.headerInfo}>
          {hotel?.address ?? "Via Tammaricella 128"} | 📞{" "}
          {hotel?.phone ?? "+1 345-67-890"} | ✉{" "}
          {hotel?.email ?? "info@hotel.com"}
        </Text>
        <Text style={styles.headerInfo}>
          {hotel?.website ?? "www.bnbnholiday.com"}
        </Text>
        <View style={styles.divider} />

        {/* Paid By & RECEIPT Title */}
        <View style={styles.topSection}>
          <View>
            <Text style={styles.sectionTitle}>Paid By</Text>
            <Text style={styles.value}>
              {user?.name ?? user?.email ?? "Guest"}
            </Text>
            <Text style={{ color: "#4b5563", fontSize: 9 }}>
              {user?.email ?? ""}
            </Text>
          </View>
          <View>
            <Text style={styles.receiptHeading}>RECEIPT</Text>
          </View>
        </View>

        {/* Booking & Receipt Details */}
        <View style={styles.detailsContainer}>
          <View style={{ width: "60%" }}>
            <Text style={styles.sectionTitle}>Booking Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Check in</Text>
              <Text style={styles.value}>
                {new Date(booking?.checkIn).toDateString()}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Check-out</Text>
              <Text style={styles.value}>
                {new Date(booking?.checkOut).toDateString()}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Guests</Text>
              <Text style={styles.value}>{booking?.guests ?? "2 adults"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Unit</Text>
              <Text style={styles.value}>
                {booking?.room?.type ?? "Apartment"}
              </Text>
            </View>
          </View>

          <View style={{ width: "35%" }}>
            <View style={[styles.row, { marginTop: 18 }]}>
              <Text style={styles.metaLabel}>Receipt #</Text>
              <Text style={styles.metaValue}>
                {booking?.receiptNo ?? "0000126"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.metaLabel}>Receipt Date</Text>
              <Text style={styles.metaValue}>
                {new Date(
                  booking?.createdAt || Date.now(),
                ).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Itemized Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colQty}>Quantity</Text>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colAmount}>Amount</Text>
          </View>

          {/* Row 1: Room Nights */}
          <View style={styles.tableRow}>
            <Text style={styles.colQty}>{nights}.00</Text>
            <Text style={styles.colDesc}>
              {nights} Nights in {booking?.room?.type ?? "Apartment"}
            </Text>
            <Text style={styles.colPrice}>${roomPrice.toFixed(2)}</Text>
            <Text style={styles.colAmount}>${subtotal.toFixed(2)}*</Text>
          </View>

          {/* Optional Extra Services (જો থাকে) */}
          {booking?.breakfastIncluded && (
            <View style={styles.tableRow}>
              <Text style={styles.colQty}>{nights}.00</Text>
              <Text style={styles.colDesc}>Breakfast</Text>
              <Text style={styles.colPrice}>$10.00</Text>
              <Text style={styles.colAmount}>${(nights * 10).toFixed(2)}*</Text>
            </View>
          )}
        </View>

        {/* Totals Section */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>

        <Text style={styles.taxNote}>*Tax: 7.5%</Text>

        {/* Notes Section */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesText}>
            {booking?.notes ??
              "Thank you for staying with us. We look forward to your next visit :)"}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export const generateInvoicePdf = async (
  bookingId: string,
): Promise<Buffer> => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { room: { include: { hotel: true } }, user: true },
  });

  const buffer = await renderToBuffer(
    <InvoiceDoc
      booking={booking}
      hotel={booking.room.hotel}
      user={booking.user}
    />,
  );

  return buffer;
};
