import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import prisma from './prisma';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11 },
  title: { fontSize: 20, marginBottom: 12, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  hr: { borderBottom: '1px solid #ccc', marginVertical: 8 },
});

const InvoiceDoc = ({ booking, hotel, user }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Booking Invoice</Text>
      <View style={styles.row}>
        <Text>Invoice for</Text>
        <Text>{user?.email ?? 'Guest'}</Text>
      </View>
      <View style={styles.row}>
        <Text>Hotel</Text>
        <Text>{hotel?.name ?? '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text>Room</Text>
        <Text>{booking?.room?.type ?? '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text>Check-in</Text>
        <Text>{new Date(booking?.checkIn).toLocaleDateString()}</Text>
      </View>
      <View style={styles.row}>
        <Text>Check-out</Text>
        <Text>{new Date(booking?.checkOut).toLocaleDateString()}</Text>
      </View>
      <View style={styles.hr} />
      <View style={styles.row}>
        <Text>Total</Text>
        <Text>{booking?.totalPrice?.toFixed(2)} {booking?.room?.currency ?? ''}</Text>
      </View>
      <Text style={{ marginTop: 16, fontSize: 9, color: '#888' }}>
        Booking ID: {booking?.id}
      </Text>
    </Page>
  </Document>
);

export const generateInvoicePdf = async (bookingId: string): Promise<Buffer> => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { room: { include: { hotel: true } }, user: true },
  });
  const buffer = await renderToBuffer(
    <InvoiceDoc booking={booking} hotel={booking.room.hotel} user={booking.user} />
  );
  return buffer;
};
