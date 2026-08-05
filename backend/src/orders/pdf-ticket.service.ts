import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

@Injectable()
export class PdfTicketService {
  async generateTicketsPDF(orderData: {
    orderId: string;
    customerName: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    tickets: Array<{
      code: string;
      ticketType: string;
      price: number;
    }>;
    subtotal: number;
    discount: number;
    serviceFee: number;
    processingFee: number;
    total: number;
    currency: string;
  }): Promise<Buffer> {
    const currency = 'DZD';
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          bufferPages: true,
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Add decorative header border
        doc
          .rect(0, 0, 595, 10)
          .fill('#2c3e50');
        
        doc
          .rect(0, 10, 595, 3)
          .fill('#FF4000');

        doc.moveDown(2);

        // Header with Logo
        doc
          .fontSize(32)
          .fillColor('#2c3e50')
          .font('Helvetica-Bold')
          .text('ORMEET', { align: 'center' })
          .moveDown(0.3);

        doc
          .fontSize(11)
          .fillColor('#7f8c8d')
          .font('Helvetica')
          .text('EVENT TICKET CONFIRMATION', { align: 'center' })
          .moveDown(0.5);

        // Order ID in a box
        doc
          .rect(50, doc.y, 495, 40)
          .fillAndStroke('#fafafa', '#e0e0e0');
        
        doc
          .fontSize(10)
          .fillColor('#7f8c8d')
          .font('Helvetica')
          .text('ORDER REFERENCE', 70, doc.y + 12, { width: 455 });
        
        doc
          .fontSize(14)
          .fillColor('#2c3e50')
          .font('Helvetica-Bold')
          .text(orderData.orderId, 70, doc.y + 5, { width: 455 });

        doc.moveDown(2);

        // Event Details Box with classic design
        const eventBoxY = doc.y;
        doc
          .rect(50, eventBoxY, 495, 110)
          .fillAndStroke('#fafafa', '#e0e0e0');
        
        // Orange accent bar
        doc
          .rect(50, eventBoxY, 5, 110)
          .fill('#FF4000');

        doc
          .fontSize(20)
          .fillColor('#2c3e50')
          .font('Helvetica-Bold')
          .text(orderData.eventTitle, 70, eventBoxY + 20, { width: 455 });
        
        doc
          .fontSize(11)
          .fillColor('#7f8c8d')
          .font('Helvetica')
          .text(`Date: ${orderData.eventDate}`, 70, eventBoxY + 55)
          .text(`Venue: ${orderData.eventLocation}`, 70, eventBoxY + 75);

        doc.moveDown(4);

        // Customer Info
        doc
          .fillColor('#7f8c8d')
          .fontSize(10)
          .font('Helvetica')
          .text('TICKET HOLDER', 50, doc.y);
        
        doc
          .fillColor('#2c3e50')
          .fontSize(13)
          .font('Helvetica-Bold')
          .text(orderData.customerName, 50, doc.y + 5)
          .moveDown(1.5);

        // Tickets Section Header
        doc
          .fontSize(14)
          .fillColor('#2c3e50')
          .font('Helvetica-Bold')
          .text('ADMISSION TICKETS', 50, doc.y);
        
        // Decorative line
        doc
          .moveTo(50, doc.y + 5)
          .lineTo(545, doc.y + 5)
          .strokeColor('#ecf0f1')
          .lineWidth(2)
          .stroke();

        doc.moveDown(1);

        // Generate each ticket
        for (let i = 0; i < orderData.tickets.length; i++) {
          const ticket = orderData.tickets[i];

          // Check if we need a new page
          if (doc.y > 620) {
            doc.addPage();
            doc.moveDown(2);
          }

          const ticketY = doc.y;

          // Ticket Box with classic border
          doc
            .rect(50, ticketY, 495, 200)
            .fillAndStroke('#ffffff', '#d0d0d0')
            .lineWidth(2);

          // Orange accent bar on left
          doc
            .rect(50, ticketY, 5, 200)
            .fill('#FF4000');

          // Ticket number badge
          doc
            .circle(530, ticketY + 15, 12)
            .fillAndStroke('#2c3e50', '#2c3e50');
          
          doc
            .fontSize(10)
            .fillColor('#ffffff')
            .font('Helvetica-Bold')
            .text(`${i + 1}`, 525, ticketY + 10, { width: 10, align: 'center' });

          // Ticket Header
          doc
            .fillColor('#2c3e50')
            .fontSize(16)
            .font('Helvetica-Bold')
            .text(ticket.ticketType, 70, ticketY + 20, { width: 300 });
          
          doc
            .fontSize(18)
            .fillColor('#FF4000')
            .font('Helvetica-Bold')
            .text(`${currency} ${ticket.price.toFixed(2)}`, 400, ticketY + 18, {
              align: 'right',
              width: 115,
            });

          // Divider line
          doc
            .moveTo(70, ticketY + 50)
            .lineTo(525, ticketY + 50)
            .strokeColor('#ecf0f1')
            .lineWidth(1)
            .stroke();

          // Ticket Code
          doc
            .fontSize(9)
            .fillColor('#7f8c8d')
            .font('Helvetica')
            .text('TICKET CODE', 70, ticketY + 65);
          
          doc
            .fontSize(13)
            .fillColor('#2c3e50')
            .font('Courier-Bold')
            .text(ticket.code, 70, ticketY + 80, {
              width: 455,
            });

          // Generate QR Code
          const qrCodeBuffer = await QRCode.toBuffer(ticket.code, {
            width: 130,
            margin: 2,
            color: {
              dark: '#2c3e50',
              light: '#FFFFFF',
            },
          });

          // QR Code box with border
          doc
            .rect(205, ticketY + 105, 90, 90)
            .fillAndStroke('#ffffff', '#e0e0e0')
            .lineWidth(1);

          // Add QR Code to PDF
          doc.image(qrCodeBuffer, 210, ticketY + 110, {
            width: 80,
            height: 80,
          });

          // Instructions
          doc
            .fontSize(9)
            .fillColor('#7f8c8d')
            .font('Helvetica-Oblique')
            .text('Scan this QR code at the event entrance for admission', 70, ticketY + 175, {
              align: 'center',
              width: 455,
            });

          doc.y = ticketY + 215;
        }

        // Payment Summary
        if (doc.y > 580) {
          doc.addPage();
          doc.moveDown(2);
        }

        doc.moveDown(1.5);
        
        // Payment Summary Header
        doc
          .fontSize(14)
          .fillColor('#2c3e50')
          .font('Helvetica-Bold')
          .text('PAYMENT SUMMARY', 50, doc.y);
        
        // Decorative line
        doc
          .moveTo(50, doc.y + 5)
          .lineTo(545, doc.y + 5)
          .strokeColor('#ecf0f1')
          .lineWidth(2)
          .stroke();

        doc.moveDown(1);

        // Summary box
        const summaryBoxY = doc.y;
        doc
          .rect(50, summaryBoxY, 495, 130)
          .fillAndStroke('#fafafa', '#e0e0e0');

        const summaryX = 380;
        doc.fontSize(11).fillColor('#7f8c8d').font('Helvetica');

        let currentY = summaryBoxY + 20;

        doc.text(`Subtotal:`, 70, currentY);
        doc.text(`${currency} ${orderData.subtotal.toFixed(2)}`, summaryX, currentY, {
          align: 'right',
          width: 145,
        });
        currentY += 20;

        if (orderData.discount > 0) {
          doc.fillColor('#27ae60').font('Helvetica-Bold');
          doc.text(`Discount:`, 70, currentY);
          doc.text(`-${currency} ${orderData.discount.toFixed(2)}`, summaryX, currentY, {
            align: 'right',
            width: 145,
          });
          currentY += 20;
          doc.fillColor('#7f8c8d').font('Helvetica');
        }

        doc.text(`Service Fee:`, 70, currentY);
        doc.text(`${currency} ${orderData.serviceFee.toFixed(2)}`, summaryX, currentY, {
          align: 'right',
          width: 145,
        });
        currentY += 20;

        doc.text(`Processing Fee:`, 70, currentY);
        doc.text(`${currency} ${orderData.processingFee.toFixed(2)}`, summaryX, currentY, {
          align: 'right',
          width: 145,
        });
        currentY += 25;

        // Divider line
        doc
          .moveTo(70, currentY - 10)
          .lineTo(525, currentY - 10)
          .strokeColor('#d0d0d0')
          .lineWidth(1)
          .stroke();

        // Total
        doc
          .fontSize(15)
          .fillColor('#27ae60')
          .font('Helvetica-Bold')
          .text(`Total Paid:`, 70, currentY);
        doc.text(`${currency} ${orderData.total.toFixed(2)}`, summaryX, currentY, {
          align: 'right',
          width: 145,
        });

        doc.y = summaryBoxY + 145;

        // Footer
        doc.moveDown(2);
        
        // Important notice box
        doc
          .rect(50, doc.y, 495, 60)
          .fillAndStroke('#fff9e6', '#ffe08a')
          .lineWidth(1);
        
        doc
          .fontSize(10)
          .fillColor('#d68910')
          .font('Helvetica-Bold')
          .text('IMPORTANT INFORMATION', 70, doc.y + 15, { width: 455 });
        
        doc
          .fontSize(9)
          .fillColor('#7f8c8d')
          .font('Helvetica')
          .text('• Present this ticket at the event entrance', 70, doc.y + 10, { width: 455 })
          .text('• Each QR code can only be scanned once', 70, doc.y + 5, { width: 455 });

        doc.moveDown(3);

        // Bottom border
        doc
          .rect(0, 832, 595, 3)
          .fill('#FF4000');
        
        doc
          .rect(0, 835, 595, 7)
          .fill('#2c3e50');

        // Footer text
        doc
          .fontSize(9)
          .fillColor('#95a5a6')
          .font('Helvetica')
          .text('Thank you for choosing Ormeet', 50, 810, { align: 'center', width: 495 });
        
        doc
          .fontSize(8)
          .fillColor('#bdc3c7')
          .text('© 2025 Ormeet. All rights reserved.', 50, 820, { align: 'center', width: 495 });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
