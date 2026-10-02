import fs from 'fs';
import path from 'path';
import os from 'os';
import { PublicBillData } from '../../types/admin';

/**
 * Pure Node.js vector PDF 1.4 generator for MomentPress Invoices.
 * Zero external native/peer dependencies - produces clean, valid PDF documents
 * with exact A4 portrait dimensions (595.28 x 841.89 pt).
 */

function escapePdfText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' '); // Keep standard printable ASCII
}

export function generateBillPdfBuffer(billData: PublicBillData): Buffer {
  const {
    orderId,
    billNumber,
    billGeneratedAt,
    createdDate,
    orderStatus,
    paymentStatus,
    paymentMethod,
    customer,
    item,
    studio,
  } = billData;

  const dateStr = billGeneratedAt
    ? new Date(billGeneratedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : createdDate;

  const unitPrice = Number(item.unitPrice) || 0;
  const quantity = Number(item.quantity) || 1;
  const subtotal = unitPrice * quantity;
  const discount = Number(item.discount) || 0;
  const finalAmount = Number(item.finalAmount) || subtotal - discount;

  // Stream commands buffer
  const ops: string[] = [];

  // Colors
  const black = '0.07 0.07 0.07';
  const darkGray = '0.25 0.25 0.25';
  const medGray = '0.45 0.45 0.45';
  const lightGray = '0.90 0.90 0.90';
  const bgBox = '0.97 0.97 0.97';
  const brandTerracotta = '0.76 0.37 0.20'; // #C25E34

  // Page dimensions: 595.28 x 841.89 pt
  const pageHeight = 841.89;
  const left = 45;
  const right = 550;
  const width = right - left; // 505 pt

  // Top header area
  let y = pageHeight - 50;

  // MOMENTPRESS Brand
  ops.push('BT');
  ops.push('/F2 22 Tf');
  ops.push(`${black} rg`);
  ops.push(`${left} ${y} Td`);
  ops.push(`(${escapePdfText((studio.name || 'MOMENTPRESS').toUpperCase())}) Tj`);
  ops.push('ET');

  // "INVOICE / BILL" Tag / Title (Right aligned)
  ops.push('BT');
  ops.push('/F2 14 Tf');
  ops.push(`${brandTerracotta} rg`);
  ops.push(`${right - 130} ${y + 5} Td`);
  ops.push('(INVOICE / BILL) Tj');
  ops.push('ET');

  y -= 14;
  // Studio Tagline
  ops.push('BT');
  ops.push('/F3 9 Tf');
  ops.push(`${medGray} rg`);
  ops.push(`${left} ${y} Td`);
  ops.push(`(${escapePdfText(studio.tagline || 'Your Photos. Your Story. Your Frame.')}) Tj`);
  ops.push('ET');

  // Bill Number (Right aligned)
  ops.push('BT');
  ops.push('/F2 10 Tf');
  ops.push(`${black} rg`);
  ops.push(`${right - 130} ${y} Td`);
  ops.push(`(Bill No: ${escapePdfText(billNumber)}) Tj`);
  ops.push('ET');

  y -= 14;
  // Studio address line 1
  ops.push('BT');
  ops.push('/F1 8 Tf');
  ops.push(`${darkGray} rg`);
  ops.push(`${left} ${y} Td`);
  ops.push(`(${escapePdfText(studio.address || 'Bowbazar, Central Kolkata, West Bengal 700012')}) Tj`);
  ops.push('ET');

  // Order ID (Right aligned)
  ops.push('BT');
  ops.push('/F1 9 Tf');
  ops.push(`${darkGray} rg`);
  ops.push(`${right - 130} ${y} Td`);
  ops.push(`(Order ID: ${escapePdfText(orderId)}) Tj`);
  ops.push('ET');

  y -= 12;
  // Studio contact (WhatsApp & Call)
  ops.push('BT');
  ops.push('/F1 8 Tf');
  ops.push(`${medGray} rg`);
  ops.push(`${left} ${y} Td`);
  ops.push(`(WhatsApp: +91 ${escapePdfText(studio.whatsappNumber || '7980855821')}  |  Email: ${escapePdfText(studio.email || 'connect.rrstudio@gmail.com')}) Tj`);
  ops.push('ET');

  // Date (Right aligned)
  ops.push('BT');
  ops.push('/F1 9 Tf');
  ops.push(`${medGray} rg`);
  ops.push(`${right - 130} ${y} Td`);
  ops.push(`(Date: ${escapePdfText(dateStr)}) Tj`);
  ops.push('ET');

  // Divider Line
  y -= 18;
  ops.push(`${lightGray} RG`);
  ops.push('1 w');
  ops.push(`${left} ${y} m`);
  ops.push(`${right} ${y} l`);
  ops.push('S');

  // Customer "BILL TO" Box & Order Details Box
  y -= 20;
  const boxTop = y;
  const boxHeight = 78;
  const boxWidthHalf = (width - 15) / 2;

  // Left Box: BILL TO
  ops.push(`${bgBox} rg`);
  ops.push(`${left} ${boxTop - boxHeight} ${boxWidthHalf} ${boxHeight} re`);
  ops.push('f');
  ops.push(`${lightGray} RG`);
  ops.push('0.5 w');
  ops.push(`${left} ${boxTop - boxHeight} ${boxWidthHalf} ${boxHeight} re`);
  ops.push('S');

  // BILL TO text
  let cy = boxTop - 14;
  ops.push('BT');
  ops.push('/F2 8 Tf');
  ops.push(`${medGray} rg`);
  ops.push(`${left + 10} ${cy} Td`);
  ops.push('(BILLED TO (CUSTOMER)) Tj');
  ops.push('ET');

  cy -= 14;
  ops.push('BT');
  ops.push('/F2 10 Tf');
  ops.push(`${black} rg`);
  ops.push(`${left + 10} ${cy} Td`);
  ops.push(`(${escapePdfText(customer.name || 'Valued Customer')}) Tj`);
  ops.push('ET');

  cy -= 12;
  ops.push('BT');
  ops.push('/F1 8.5 Tf');
  ops.push(`${darkGray} rg`);
  ops.push(`${left + 10} ${cy} Td`);
  ops.push(`(Phone: +91 ${escapePdfText(customer.mobileNumber || '')}) Tj`);
  ops.push('ET');

  cy -= 12;
  ops.push('BT');
  ops.push('/F1 8 Tf');
  ops.push(`${medGray} rg`);
  ops.push(`${left + 10} ${cy} Td`);
  const addrClean = escapePdfText(customer.address || 'Address provided on order');
  ops.push(`(${addrClean.length > 40 ? addrClean.substring(0, 38) + '...' : addrClean}) Tj`);
  ops.push('ET');

  cy -= 11;
  ops.push('BT');
  ops.push('/F1 8 Tf');
  ops.push(`${medGray} rg`);
  ops.push(`${left + 10} ${cy} Td`);
  ops.push(`(${escapePdfText(customer.city || 'Kolkata')} - ${escapePdfText(customer.pincode || '')}) Tj`);
  ops.push('ET');

  // Right Box: ORDER & PAYMENT STATUS
  const rightBoxLeft = left + boxWidthHalf + 15;
  ops.push(`${bgBox} rg`);
  ops.push(`${rightBoxLeft} ${boxTop - boxHeight} ${boxWidthHalf} ${boxHeight} re`);
  ops.push('f');
  ops.push(`${lightGray} RG`);
  ops.push('0.5 w');
  ops.push(`${rightBoxLeft} ${boxTop - boxHeight} ${boxWidthHalf} ${boxHeight} re`);
  ops.push('S');

  cy = boxTop - 14;
  ops.push('BT');
  ops.push('/F2 8 Tf');
  ops.push(`${medGray} rg`);
  ops.push(`${rightBoxLeft + 10} ${cy} Td`);
  ops.push('(ORDER & PAYMENT DETAILS) Tj');
  ops.push('ET');

  cy -= 14;
  ops.push('BT');
  ops.push('/F1 8.5 Tf');
  ops.push(`${darkGray} rg`);
  ops.push(`${rightBoxLeft + 10} ${cy} Td`);
  ops.push(`(Order Status: ) Tj`);
  ops.push('/F2 8.5 Tf');
  ops.push(`${black} rg`);
  ops.push(`(${escapePdfText(orderStatus || 'Pending')}) Tj`);
  ops.push('ET');

  cy -= 13;
  ops.push('BT');
  ops.push('/F1 8.5 Tf');
  ops.push(`${darkGray} rg`);
  ops.push(`${rightBoxLeft + 10} ${cy} Td`);
  ops.push(`(Payment Status: ) Tj`);
  ops.push('/F2 8.5 Tf');
  ops.push(`${black} rg`);
  ops.push(`(${escapePdfText(paymentStatus || 'Pending')}) Tj`);
  ops.push('ET');

  cy -= 13;
  ops.push('BT');
  ops.push('/F1 8.5 Tf');
  ops.push(`${darkGray} rg`);
  ops.push(`${rightBoxLeft + 10} ${cy} Td`);
  ops.push(`(Payment Method: ) Tj`);
  ops.push('/F2 8.5 Tf');
  ops.push(`${black} rg`);
  ops.push(`(${escapePdfText(paymentMethod || 'UPI on Delivery')}) Tj`);
  ops.push('ET');

  cy -= 13;
  ops.push('BT');
  ops.push('/F3 7.5 Tf');
  ops.push(`${medGray} rg`);
  ops.push(`${rightBoxLeft + 10} ${cy} Td`);
  ops.push('(Free digital WhatsApp proof verified before print production) Tj');
  ops.push('ET');

  // Items Table
  y = boxTop - boxHeight - 25;

  // Table Header Background
  const thHeight = 22;
  ops.push(`${bgBox} rg`);
  ops.push(`${left} ${y - thHeight} ${width} ${thHeight} re`);
  ops.push('f');
  ops.push(`${lightGray} RG`);
  ops.push('0.5 w');
  ops.push(`${left} ${y - thHeight} ${width} ${thHeight} re`);
  ops.push('S');

  // Table Header Text
  const thY = y - 15;
  ops.push('BT');
  ops.push('/F2 8.5 Tf');
  ops.push(`${darkGray} rg`);
  ops.push(`${left + 10} ${thY} Td`);
  ops.push('(ITEM & SPECIFICATIONS) Tj');
  ops.push('ET');

  ops.push('BT');
  ops.push('/F2 8.5 Tf');
  ops.push(`${darkGray} rg`);
  ops.push(`${left + 300} ${thY} Td`);
  ops.push('(QTY) Tj');
  ops.push('ET');

  ops.push('BT');
  ops.push('/F2 8.5 Tf');
  ops.push(`${darkGray} rg`);
  ops.push(`${left + 370} ${thY} Td`);
  ops.push('(UNIT PRICE) Tj');
  ops.push('ET');

  ops.push('BT');
  ops.push('/F2 8.5 Tf');
  ops.push(`${darkGray} rg`);
  ops.push(`${right - 60} ${thY} Td`);
  ops.push('(AMOUNT) Tj');
  ops.push('ET');

  // Table Body Row
  y -= thHeight;
  const rowHeight = 60;
  ops.push(`${lightGray} RG`);
  ops.push('0.5 w');
  ops.push(`${left} ${y - rowHeight} ${width} ${rowHeight} re`);
  ops.push('S');

  // Item title
  let iy = y - 16;
  ops.push('BT');
  ops.push('/F2 10 Tf');
  ops.push(`${black} rg`);
  ops.push(`${left + 10} ${iy} Td`);
  ops.push(`(${escapePdfText(item.product || 'Custom Frame')}) Tj`);
  ops.push('ET');

  // Item Specs
  iy -= 13;
  ops.push('BT');
  ops.push('/F1 8.5 Tf');
  ops.push(`${medGray} rg`);
  ops.push(`${left + 10} ${iy} Td`);
  ops.push(`(Size: ${escapePdfText(item.size || '')}) Tj`);
  ops.push('ET');

  iy -= 11;
  const finishText = item.finish && item.finish !== 'N/A' ? `  |  Moulding: ${item.finish}` : '';
  const qualityText = item.quality ? `  |  Paper: ${item.quality}` : '';
  ops.push('BT');
  ops.push('/F1 8 Tf');
  ops.push(`${medGray} rg`);
  ops.push(`${left + 10} ${iy} Td`);
  ops.push(`(Handcrafted Solid Wood Frame${escapePdfText(finishText)}${escapePdfText(qualityText)}) Tj`);
  ops.push('ET');

  // Qty
  ops.push('BT');
  ops.push('/F2 9.5 Tf');
  ops.push(`${black} rg`);
  ops.push(`${left + 308} ${y - 20} Td`);
  ops.push(`(${quantity}) Tj`);
  ops.push('ET');

  // Unit Price
  ops.push('BT');
  ops.push('/F1 9.5 Tf');
  ops.push(`${darkGray} rg`);
  ops.push(`${left + 375} ${y - 20} Td`);
  ops.push(`(Rs. ${unitPrice}) Tj`);
  ops.push('ET');

  // Amount
  ops.push('BT');
  ops.push('/F2 10 Tf');
  ops.push(`${black} rg`);
  ops.push(`${right - 60} ${y - 20} Td`);
  ops.push(`(Rs. ${subtotal}) Tj`);
  ops.push('ET');

  y -= rowHeight;

  // Customer Requirements / Notes Box (if present)
  if (item.requirements && item.requirements.trim()) {
    y -= 12;
    const reqHeight = 36;
    ops.push('0.98 0.96 0.92 rg'); // subtle warm tint
    ops.push(`${left} ${y - reqHeight} ${width} ${reqHeight} re`);
    ops.push('f');
    ops.push('0.85 0.78 0.70 RG');
    ops.push('0.5 w');
    ops.push(`${left} ${y - reqHeight} ${width} ${reqHeight} re`);
    ops.push('S');

    ops.push('BT');
    ops.push('/F2 8 Tf');
    ops.push(`${brandTerracotta} rg`);
    ops.push(`${left + 10} ${y - 12} Td`);
    ops.push('(CUSTOMER SPECIAL INSTRUCTIONS / REQUIREMENTS:) Tj');
    ops.push('ET');

    const cleanReq = escapePdfText(item.requirements.trim());
    ops.push('BT');
    ops.push('/F1 8 Tf');
    ops.push(`${darkGray} rg`);
    ops.push(`${left + 10} ${y - 24} Td`);
    ops.push(`(${cleanReq.length > 100 ? cleanReq.substring(0, 97) + '...' : cleanReq}) Tj`);
    ops.push('ET');

    y -= reqHeight;
  }

  // Price Summary Area (Right-aligned)
  y -= 20;
  const summaryLeft = right - 180;

  // Subtotal
  ops.push('BT');
  ops.push('/F1 9 Tf');
  ops.push(`${darkGray} rg`);
  ops.push(`${summaryLeft} ${y} Td`);
  ops.push('(Subtotal:) Tj');
  ops.push('ET');

  ops.push('BT');
  ops.push('/F2 9.5 Tf');
  ops.push(`${black} rg`);
  ops.push(`${right - 55} ${y} Td`);
  ops.push(`(Rs. ${subtotal}) Tj`);
  ops.push('ET');

  // Discount
  if (discount > 0) {
    y -= 14;
    ops.push('BT');
    ops.push('/F1 9 Tf');
    ops.push('0.15 0.55 0.30 rg');
    ops.push(`${summaryLeft} ${y} Td`);
    ops.push('(Promotional Discount:) Tj');
    ops.push('ET');

    ops.push('BT');
    ops.push('/F2 9.5 Tf');
    ops.push('0.15 0.55 0.30 rg');
    ops.push(`${right - 55} ${y} Td`);
    ops.push(`(-Rs. ${discount}) Tj`);
    ops.push('ET');
  }

  // Delivery
  y -= 14;
  ops.push('BT');
  ops.push('/F1 8.5 Tf');
  ops.push(`${medGray} rg`);
  ops.push(`${summaryLeft} ${y} Td`);
  ops.push('(Delivery & Packaging:) Tj');
  ops.push('ET');

  ops.push('BT');
  ops.push('/F2 8.5 Tf');
  ops.push('0.15 0.55 0.30 rg');
  ops.push(`${right - 55} ${y} Td`);
  ops.push('(Included) Tj');
  ops.push('ET');

  // Divider for Total
  y -= 10;
  ops.push(`${black} RG`);
  ops.push('1.5 w');
  ops.push(`${summaryLeft} ${y} m`);
  ops.push(`${right} ${y} l`);
  ops.push('S');

  // TOTAL PAYABLE
  y -= 16;
  ops.push('BT');
  ops.push('/F2 11 Tf');
  ops.push(`${black} rg`);
  ops.push(`${summaryLeft} ${y} Td`);
  ops.push('(TOTAL PAYABLE:) Tj');
  ops.push('ET');

  ops.push('BT');
  ops.push('/F2 13 Tf');
  ops.push(`${brandTerracotta} rg`);
  ops.push(`${right - 65} ${y} Td`);
  ops.push(`(Rs. ${finalAmount}) Tj`);
  ops.push('ET');

  // Bottom Footer Section
  const footerY = 70;
  ops.push(`${lightGray} RG`);
  ops.push('0.5 w');
  ops.push(`${left} ${footerY + 30} m`);
  ops.push(`${right} ${footerY + 30} l`);
  ops.push('S');

  ops.push('BT');
  ops.push('/F2 9.5 Tf');
  ops.push(`${black} rg`);
  ops.push(`${left + 160} ${footerY + 16} Td`);
  ops.push('(Thank you for choosing MomentPress!) Tj');
  ops.push('ET');

  ops.push('BT');
  ops.push('/F1 8 Tf');
  ops.push(`${darkGray} rg`);
  ops.push(`${left + 95} ${footerY + 4} Td`);
  ops.push('(Handcrafted with care by MomentPress  *  Bowbazar, Central Kolkata, West Bengal 700012) Tj');
  ops.push('ET');

  ops.push('BT');
  ops.push('/F1 8 Tf');
  ops.push(`${brandTerracotta} rg`);
  ops.push(`${left + 120} ${footerY - 8} Td`);
  ops.push(`(WhatsApp Support: +91 ${escapePdfText(studio.whatsappNumber || '7980855821')}  |  Instagram: @_rr.studio__) Tj`);
  ops.push('ET');

  const contentStream = ops.join('\n');
  const streamLength = Buffer.byteLength(contentStream, 'latin1');

  // Build PDF 1.4 Document
  const pdfChunks: Buffer[] = [];
  const offsets: number[] = [];

  function addChunk(str: string): number {
    const buf = Buffer.from(str, 'latin1');
    const offset = pdfChunks.reduce((acc, c) => acc + c.length, 0);
    pdfChunks.push(buf);
    return offset;
  }

  addChunk('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  // Obj 1: Catalog
  offsets[1] = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  addChunk('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Obj 2: Pages
  offsets[2] = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  addChunk('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // Obj 3: Page (A4: 595.28 x 841.89 pt)
  offsets[3] = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  addChunk('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >>\nendobj\n');

  // Obj 4: Contents
  offsets[4] = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  addChunk(`4 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`);

  // Obj 5: Helvetica (F1)
  offsets[5] = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  addChunk('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n');

  // Obj 6: Helvetica-Bold (F2)
  offsets[6] = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  addChunk('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n');

  // Obj 7: Helvetica-Oblique (F3)
  offsets[7] = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  addChunk('7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>\nendobj\n');

  // xref
  const xrefOffset = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  let xref = 'xref\n0 8\n0000000000 65535 f \n';
  for (let i = 1; i <= 7; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }

  const trailer = `trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  addChunk(xref + trailer);

  return Buffer.concat(pdfChunks);
}

/**
 * Generates and writes bill PDF to local storage.
 */
export async function generateAndSaveBillPdf(billData: PublicBillData, targetDir = 'data/bills'): Promise<{ filePath: string; fileName: string; buffer: Buffer }> {
  let effectiveDir = targetDir;
  try {
    if (!fs.existsSync(effectiveDir)) {
      fs.mkdirSync(effectiveDir, { recursive: true });
    }
  } catch (_) {
    effectiveDir = path.join(os.tmpdir(), 'momentpress-bills');
    try {
      if (!fs.existsSync(effectiveDir)) {
        fs.mkdirSync(effectiveDir, { recursive: true });
      }
    } catch (_) {}
  }

  const numericSuffix = String(billData.orderId || '').replace(/^MP-/i, '').trim();
  const fileName = `MomentPress-Bill-MP-${numericSuffix || billData.orderId}.pdf`;
  const filePath = path.join(effectiveDir, fileName);
  const buffer = generateBillPdfBuffer(billData);

  try {
    await fs.promises.writeFile(filePath, buffer);
  } catch (err) {
    console.warn('[PDF Generator] Local write warning:', err);
    const fallbackPath = path.join(os.tmpdir(), fileName);
    try {
      await fs.promises.writeFile(fallbackPath, buffer);
      return { filePath: fallbackPath, fileName, buffer };
    } catch (_) {}
  }
  return { filePath, fileName, buffer };
}
