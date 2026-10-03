// server.ts
import express from "express";
import path2 from "path";
import fs2 from "fs";
import crypto from "crypto";
import os2 from "os";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// src/lib/admin/default-inventory.ts
var DEFAULT_INVENTORY_ITEMS = [
  {
    id: "INV-FRM-5X7",
    name: "5\xD77 Solid Wood Frame Moulding",
    category: "Frames",
    unit: "pcs",
    currentStock: 45,
    minimumStock: 10,
    purchaseCost: 65,
    supplier: "Bengal Timber & Moulding Co, Bowbazar",
    active: true,
    lastUpdated: "2026-09-29"
  },
  {
    id: "INV-FRM-6X8",
    name: "6\xD78 Solid Wood Frame Moulding",
    category: "Frames",
    unit: "pcs",
    currentStock: 50,
    minimumStock: 15,
    purchaseCost: 78,
    supplier: "Bengal Timber & Moulding Co, Bowbazar",
    active: true,
    lastUpdated: "2026-09-29"
  },
  {
    id: "INV-FRM-8X10",
    name: "8\xD710 Solid Wood Frame Moulding",
    category: "Frames",
    unit: "pcs",
    currentStock: 35,
    minimumStock: 10,
    purchaseCost: 110,
    supplier: "Bengal Timber & Moulding Co, Bowbazar",
    active: true,
    lastUpdated: "2026-09-29"
  },
  {
    id: "INV-FRM-10X12",
    name: "10\xD712 Solid Wood Frame Moulding",
    category: "Frames",
    unit: "pcs",
    currentStock: 25,
    minimumStock: 8,
    purchaseCost: 145,
    supplier: "Bengal Timber & Moulding Co, Bowbazar",
    active: true,
    lastUpdated: "2026-09-29"
  },
  {
    id: "INV-FRM-12X18",
    name: "12\xD718 Solid Wood Frame Moulding",
    category: "Frames",
    unit: "pcs",
    currentStock: 18,
    minimumStock: 6,
    purchaseCost: 195,
    supplier: "Bengal Timber & Moulding Co, Bowbazar",
    active: true,
    lastUpdated: "2026-09-29"
  },
  {
    id: "INV-GLS-5X7",
    name: "5\xD77 Protective Float Glass",
    category: "Frames",
    unit: "pcs",
    currentStock: 60,
    minimumStock: 15,
    purchaseCost: 20,
    supplier: "Calcutta Glass Merchants, College St",
    active: true,
    lastUpdated: "2026-09-29"
  },
  {
    id: "INV-GLS-6X8",
    name: "6\xD78 Protective Float Glass",
    category: "Frames",
    unit: "pcs",
    currentStock: 55,
    minimumStock: 15,
    purchaseCost: 25,
    supplier: "Calcutta Glass Merchants, College St",
    active: true,
    lastUpdated: "2026-09-29"
  },
  {
    id: "INV-GLS-8X10",
    name: "8\xD710 Protective Float Glass",
    category: "Frames",
    unit: "pcs",
    currentStock: 40,
    minimumStock: 10,
    purchaseCost: 35,
    supplier: "Calcutta Glass Merchants, College St",
    active: true,
    lastUpdated: "2026-09-29"
  },
  {
    id: "INV-GLS-10X12",
    name: "10\xD712 Protective Float Glass",
    category: "Frames",
    unit: "pcs",
    currentStock: 30,
    minimumStock: 8,
    purchaseCost: 45,
    supplier: "Calcutta Glass Merchants, College St",
    active: true,
    lastUpdated: "2026-09-29"
  },
  {
    id: "INV-GLS-12X18",
    name: "12\xD718 Protective Float Glass",
    category: "Frames",
    unit: "pcs",
    currentStock: 20,
    minimumStock: 5,
    purchaseCost: 65,
    supplier: "Calcutta Glass Merchants, College St",
    active: true,
    lastUpdated: "2026-09-29"
  },
  {
    id: "INV-PPR-LUSTER",
    name: "240 GSM Luster Photo Paper",
    category: "Photo Paper",
    unit: "sheets",
    currentStock: 150,
    minimumStock: 30,
    purchaseCost: 15,
    supplier: "Kolkata Graphic Papers, Chandni Chowk",
    active: true,
    lastUpdated: "2026-09-29"
  },
  {
    id: "INV-PPR-VELVET",
    name: "280 GSM Studio Velvet Satin Paper",
    category: "Photo Paper",
    unit: "sheets",
    currentStock: 100,
    minimumStock: 25,
    purchaseCost: 28,
    supplier: "Kolkata Graphic Papers, Chandni Chowk",
    active: true,
    lastUpdated: "2026-09-29"
  },
  {
    id: "INV-PPR-ARCHIVAL",
    name: "310 GSM Archival Fine Art Cotton Rag",
    category: "Photo Paper",
    unit: "sheets",
    currentStock: 60,
    minimumStock: 15,
    purchaseCost: 55,
    supplier: "Kolkata Graphic Papers, Chandni Chowk",
    active: true,
    lastUpdated: "2026-09-29"
  },
  {
    id: "INV-STK-VINYL",
    name: "Satin Vinyl Waterproof Sticker Sheets",
    category: "Sticker Paper",
    unit: "sheets",
    currentStock: 120,
    minimumStock: 25,
    purchaseCost: 18,
    supplier: "Apex Vinyl Imports, Burrabazar",
    active: true,
    lastUpdated: "2026-09-29"
  },
  {
    id: "INV-PKG-FRM",
    name: "Reinforced Frame Box & Corner Protectors",
    category: "Packaging",
    unit: "boxes",
    currentStock: 90,
    minimumStock: 20,
    purchaseCost: 22,
    supplier: "Metro Corrugated Cartons, Sealdah",
    active: true,
    lastUpdated: "2026-09-29"
  },
  {
    id: "INV-PKG-STK",
    name: "Rigid Non-Bending Sticker Mailer",
    category: "Packaging",
    unit: "pcs",
    currentStock: 140,
    minimumStock: 30,
    purchaseCost: 8,
    supplier: "Metro Corrugated Cartons, Sealdah",
    active: true,
    lastUpdated: "2026-09-29"
  }
];
var DEFAULT_PRODUCT_MAPPINGS = [
  {
    id: "MAP-FRM-5X7",
    productType: "custom-photo-frames",
    productName: "Custom Photo Frames",
    sizeName: "5\xD77 in",
    consumes: [
      { inventoryItemId: "INV-FRM-5X7", quantityPerUnit: 1 },
      { inventoryItemId: "INV-GLS-5X7", quantityPerUnit: 1 },
      { inventoryItemId: "INV-PPR-LUSTER", quantityPerUnit: 1 },
      { inventoryItemId: "INV-PKG-FRM", quantityPerUnit: 1 }
    ]
  },
  {
    id: "MAP-FRM-6X8",
    productType: "custom-photo-frames",
    productName: "Custom Photo Frames",
    sizeName: "6\xD78 in",
    consumes: [
      { inventoryItemId: "INV-FRM-6X8", quantityPerUnit: 1 },
      { inventoryItemId: "INV-GLS-6X8", quantityPerUnit: 1 },
      { inventoryItemId: "INV-PPR-LUSTER", quantityPerUnit: 1 },
      { inventoryItemId: "INV-PKG-FRM", quantityPerUnit: 1 }
    ]
  },
  {
    id: "MAP-FRM-8X10",
    productType: "custom-photo-frames",
    productName: "Custom Photo Frames",
    sizeName: "8\xD710 in",
    consumes: [
      { inventoryItemId: "INV-FRM-8X10", quantityPerUnit: 1 },
      { inventoryItemId: "INV-GLS-8X10", quantityPerUnit: 1 },
      { inventoryItemId: "INV-PPR-LUSTER", quantityPerUnit: 1 },
      { inventoryItemId: "INV-PKG-FRM", quantityPerUnit: 1 }
    ]
  },
  {
    id: "MAP-FRM-10X12",
    productType: "custom-photo-frames",
    productName: "Custom Photo Frames",
    sizeName: "10\xD712 in",
    consumes: [
      { inventoryItemId: "INV-FRM-10X12", quantityPerUnit: 1 },
      { inventoryItemId: "INV-GLS-10X12", quantityPerUnit: 1 },
      { inventoryItemId: "INV-PPR-LUSTER", quantityPerUnit: 1 },
      { inventoryItemId: "INV-PKG-FRM", quantityPerUnit: 1 }
    ]
  },
  {
    id: "MAP-FRM-12X18",
    productType: "custom-photo-frames",
    productName: "Custom Photo Frames",
    sizeName: "12\xD718 in",
    consumes: [
      { inventoryItemId: "INV-FRM-12X18", quantityPerUnit: 1 },
      { inventoryItemId: "INV-GLS-12X18", quantityPerUnit: 1 },
      { inventoryItemId: "INV-PPR-LUSTER", quantityPerUnit: 1 },
      { inventoryItemId: "INV-PKG-FRM", quantityPerUnit: 1 }
    ]
  },
  {
    id: "MAP-STK-SMALL",
    productType: "photo-stickers",
    productName: "Photo Stickers",
    sizeName: "Small",
    consumes: [
      { inventoryItemId: "INV-STK-VINYL", quantityPerUnit: 1 },
      { inventoryItemId: "INV-PKG-STK", quantityPerUnit: 1 }
    ]
  },
  {
    id: "MAP-STK-MEDIUM",
    productType: "photo-stickers",
    productName: "Photo Stickers",
    sizeName: "Medium",
    consumes: [
      { inventoryItemId: "INV-STK-VINYL", quantityPerUnit: 1 },
      { inventoryItemId: "INV-PKG-STK", quantityPerUnit: 1 }
    ]
  },
  {
    id: "MAP-STK-LARGE",
    productType: "photo-stickers",
    productName: "Photo Stickers",
    sizeName: "Large",
    consumes: [
      { inventoryItemId: "INV-STK-VINYL", quantityPerUnit: 2 },
      { inventoryItemId: "INV-PKG-STK", quantityPerUnit: 1 }
    ]
  }
];

// src/lib/billing/pdf-generator.ts
import fs from "fs";
import path from "path";
import os from "os";
function escapePdfText(str) {
  if (!str) return "";
  return str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7E]/g, " ");
}
function generateBillPdfBuffer(billData) {
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
    studio
  } = billData;
  const dateStr = billGeneratedAt ? new Date(billGeneratedAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }) : createdDate;
  const unitPrice = Number(item.unitPrice) || 0;
  const quantity = Number(item.quantity) || 1;
  const subtotal = unitPrice * quantity;
  const discount = Number(item.discount) || 0;
  const finalAmount = Number(item.finalAmount) || subtotal - discount;
  const ops = [];
  const black = "0.07 0.07 0.07";
  const darkGray = "0.25 0.25 0.25";
  const medGray = "0.45 0.45 0.45";
  const lightGray = "0.90 0.90 0.90";
  const bgBox = "0.97 0.97 0.97";
  const brandTerracotta = "0.76 0.37 0.20";
  const pageHeight = 841.89;
  const left = 45;
  const right = 550;
  const width = right - left;
  let y = pageHeight - 50;
  ops.push("BT");
  ops.push("/F2 22 Tf");
  ops.push(`${black} rg`);
  ops.push(`${left} ${y} Td`);
  ops.push(`(${escapePdfText((studio.name || "MOMENTPRESS").toUpperCase())}) Tj`);
  ops.push("ET");
  ops.push("BT");
  ops.push("/F2 14 Tf");
  ops.push(`${brandTerracotta} rg`);
  ops.push(`${right - 130} ${y + 5} Td`);
  ops.push("(INVOICE / BILL) Tj");
  ops.push("ET");
  y -= 14;
  ops.push("BT");
  ops.push("/F3 9 Tf");
  ops.push(`${medGray} rg`);
  ops.push(`${left} ${y} Td`);
  ops.push(`(${escapePdfText(studio.tagline || "Your Photos. Your Story. Your Frame.")}) Tj`);
  ops.push("ET");
  ops.push("BT");
  ops.push("/F2 10 Tf");
  ops.push(`${black} rg`);
  ops.push(`${right - 130} ${y} Td`);
  ops.push(`(Bill No: ${escapePdfText(billNumber)}) Tj`);
  ops.push("ET");
  y -= 14;
  ops.push("BT");
  ops.push("/F1 8 Tf");
  ops.push(`${darkGray} rg`);
  ops.push(`${left} ${y} Td`);
  ops.push(`(${escapePdfText(studio.address || "Bowbazar, Central Kolkata, West Bengal 700012")}) Tj`);
  ops.push("ET");
  ops.push("BT");
  ops.push("/F1 9 Tf");
  ops.push(`${darkGray} rg`);
  ops.push(`${right - 130} ${y} Td`);
  ops.push(`(Order ID: ${escapePdfText(orderId)}) Tj`);
  ops.push("ET");
  y -= 12;
  ops.push("BT");
  ops.push("/F1 8 Tf");
  ops.push(`${medGray} rg`);
  ops.push(`${left} ${y} Td`);
  ops.push(`(WhatsApp: +91 ${escapePdfText(studio.whatsappNumber || "7980855821")}  |  Email: ${escapePdfText(studio.email || "connect.rrstudio@gmail.com")}) Tj`);
  ops.push("ET");
  ops.push("BT");
  ops.push("/F1 9 Tf");
  ops.push(`${medGray} rg`);
  ops.push(`${right - 130} ${y} Td`);
  ops.push(`(Date: ${escapePdfText(dateStr)}) Tj`);
  ops.push("ET");
  y -= 18;
  ops.push(`${lightGray} RG`);
  ops.push("1 w");
  ops.push(`${left} ${y} m`);
  ops.push(`${right} ${y} l`);
  ops.push("S");
  y -= 20;
  const boxTop = y;
  const boxHeight = 78;
  const boxWidthHalf = (width - 15) / 2;
  ops.push(`${bgBox} rg`);
  ops.push(`${left} ${boxTop - boxHeight} ${boxWidthHalf} ${boxHeight} re`);
  ops.push("f");
  ops.push(`${lightGray} RG`);
  ops.push("0.5 w");
  ops.push(`${left} ${boxTop - boxHeight} ${boxWidthHalf} ${boxHeight} re`);
  ops.push("S");
  let cy = boxTop - 14;
  ops.push("BT");
  ops.push("/F2 8 Tf");
  ops.push(`${medGray} rg`);
  ops.push(`${left + 10} ${cy} Td`);
  ops.push("(BILLED TO (CUSTOMER)) Tj");
  ops.push("ET");
  cy -= 14;
  ops.push("BT");
  ops.push("/F2 10 Tf");
  ops.push(`${black} rg`);
  ops.push(`${left + 10} ${cy} Td`);
  ops.push(`(${escapePdfText(customer.name || "Valued Customer")}) Tj`);
  ops.push("ET");
  cy -= 12;
  ops.push("BT");
  ops.push("/F1 8.5 Tf");
  ops.push(`${darkGray} rg`);
  ops.push(`${left + 10} ${cy} Td`);
  ops.push(`(Phone: +91 ${escapePdfText(customer.mobileNumber || "")}) Tj`);
  ops.push("ET");
  cy -= 12;
  ops.push("BT");
  ops.push("/F1 8 Tf");
  ops.push(`${medGray} rg`);
  ops.push(`${left + 10} ${cy} Td`);
  const addrClean = escapePdfText(customer.address || "Address provided on order");
  ops.push(`(${addrClean.length > 40 ? addrClean.substring(0, 38) + "..." : addrClean}) Tj`);
  ops.push("ET");
  cy -= 11;
  ops.push("BT");
  ops.push("/F1 8 Tf");
  ops.push(`${medGray} rg`);
  ops.push(`${left + 10} ${cy} Td`);
  ops.push(`(${escapePdfText(customer.city || "Kolkata")} - ${escapePdfText(customer.pincode || "")}) Tj`);
  ops.push("ET");
  const rightBoxLeft = left + boxWidthHalf + 15;
  ops.push(`${bgBox} rg`);
  ops.push(`${rightBoxLeft} ${boxTop - boxHeight} ${boxWidthHalf} ${boxHeight} re`);
  ops.push("f");
  ops.push(`${lightGray} RG`);
  ops.push("0.5 w");
  ops.push(`${rightBoxLeft} ${boxTop - boxHeight} ${boxWidthHalf} ${boxHeight} re`);
  ops.push("S");
  cy = boxTop - 14;
  ops.push("BT");
  ops.push("/F2 8 Tf");
  ops.push(`${medGray} rg`);
  ops.push(`${rightBoxLeft + 10} ${cy} Td`);
  ops.push("(ORDER & PAYMENT DETAILS) Tj");
  ops.push("ET");
  cy -= 14;
  ops.push("BT");
  ops.push("/F1 8.5 Tf");
  ops.push(`${darkGray} rg`);
  ops.push(`${rightBoxLeft + 10} ${cy} Td`);
  ops.push(`(Order Status: ) Tj`);
  ops.push("/F2 8.5 Tf");
  ops.push(`${black} rg`);
  ops.push(`(${escapePdfText(orderStatus || "Pending")}) Tj`);
  ops.push("ET");
  cy -= 13;
  ops.push("BT");
  ops.push("/F1 8.5 Tf");
  ops.push(`${darkGray} rg`);
  ops.push(`${rightBoxLeft + 10} ${cy} Td`);
  ops.push(`(Payment Status: ) Tj`);
  ops.push("/F2 8.5 Tf");
  ops.push(`${black} rg`);
  ops.push(`(${escapePdfText(paymentStatus || "Pending")}) Tj`);
  ops.push("ET");
  cy -= 13;
  ops.push("BT");
  ops.push("/F1 8.5 Tf");
  ops.push(`${darkGray} rg`);
  ops.push(`${rightBoxLeft + 10} ${cy} Td`);
  ops.push(`(Payment Method: ) Tj`);
  ops.push("/F2 8.5 Tf");
  ops.push(`${black} rg`);
  ops.push(`(${escapePdfText(paymentMethod || "UPI on Delivery")}) Tj`);
  ops.push("ET");
  cy -= 13;
  ops.push("BT");
  ops.push("/F3 7.5 Tf");
  ops.push(`${medGray} rg`);
  ops.push(`${rightBoxLeft + 10} ${cy} Td`);
  ops.push("(Free digital WhatsApp proof verified before print production) Tj");
  ops.push("ET");
  y = boxTop - boxHeight - 25;
  const thHeight = 22;
  ops.push(`${bgBox} rg`);
  ops.push(`${left} ${y - thHeight} ${width} ${thHeight} re`);
  ops.push("f");
  ops.push(`${lightGray} RG`);
  ops.push("0.5 w");
  ops.push(`${left} ${y - thHeight} ${width} ${thHeight} re`);
  ops.push("S");
  const thY = y - 15;
  ops.push("BT");
  ops.push("/F2 8.5 Tf");
  ops.push(`${darkGray} rg`);
  ops.push(`${left + 10} ${thY} Td`);
  ops.push("(ITEM & SPECIFICATIONS) Tj");
  ops.push("ET");
  ops.push("BT");
  ops.push("/F2 8.5 Tf");
  ops.push(`${darkGray} rg`);
  ops.push(`${left + 300} ${thY} Td`);
  ops.push("(QTY) Tj");
  ops.push("ET");
  ops.push("BT");
  ops.push("/F2 8.5 Tf");
  ops.push(`${darkGray} rg`);
  ops.push(`${left + 370} ${thY} Td`);
  ops.push("(UNIT PRICE) Tj");
  ops.push("ET");
  ops.push("BT");
  ops.push("/F2 8.5 Tf");
  ops.push(`${darkGray} rg`);
  ops.push(`${right - 60} ${thY} Td`);
  ops.push("(AMOUNT) Tj");
  ops.push("ET");
  y -= thHeight;
  const rowHeight = 60;
  ops.push(`${lightGray} RG`);
  ops.push("0.5 w");
  ops.push(`${left} ${y - rowHeight} ${width} ${rowHeight} re`);
  ops.push("S");
  let iy = y - 16;
  ops.push("BT");
  ops.push("/F2 10 Tf");
  ops.push(`${black} rg`);
  ops.push(`${left + 10} ${iy} Td`);
  ops.push(`(${escapePdfText(item.product || "Custom Frame")}) Tj`);
  ops.push("ET");
  iy -= 13;
  ops.push("BT");
  ops.push("/F1 8.5 Tf");
  ops.push(`${medGray} rg`);
  ops.push(`${left + 10} ${iy} Td`);
  ops.push(`(Size: ${escapePdfText(item.size || "")}) Tj`);
  ops.push("ET");
  iy -= 11;
  const finishText = item.finish && item.finish !== "N/A" ? `  |  Moulding: ${item.finish}` : "";
  const qualityText = item.quality ? `  |  Paper: ${item.quality}` : "";
  ops.push("BT");
  ops.push("/F1 8 Tf");
  ops.push(`${medGray} rg`);
  ops.push(`${left + 10} ${iy} Td`);
  ops.push(`(Handcrafted Solid Wood Frame${escapePdfText(finishText)}${escapePdfText(qualityText)}) Tj`);
  ops.push("ET");
  ops.push("BT");
  ops.push("/F2 9.5 Tf");
  ops.push(`${black} rg`);
  ops.push(`${left + 308} ${y - 20} Td`);
  ops.push(`(${quantity}) Tj`);
  ops.push("ET");
  ops.push("BT");
  ops.push("/F1 9.5 Tf");
  ops.push(`${darkGray} rg`);
  ops.push(`${left + 375} ${y - 20} Td`);
  ops.push(`(Rs. ${unitPrice}) Tj`);
  ops.push("ET");
  ops.push("BT");
  ops.push("/F2 10 Tf");
  ops.push(`${black} rg`);
  ops.push(`${right - 60} ${y - 20} Td`);
  ops.push(`(Rs. ${subtotal}) Tj`);
  ops.push("ET");
  y -= rowHeight;
  if (item.requirements && item.requirements.trim()) {
    y -= 12;
    const reqHeight = 36;
    ops.push("0.98 0.96 0.92 rg");
    ops.push(`${left} ${y - reqHeight} ${width} ${reqHeight} re`);
    ops.push("f");
    ops.push("0.85 0.78 0.70 RG");
    ops.push("0.5 w");
    ops.push(`${left} ${y - reqHeight} ${width} ${reqHeight} re`);
    ops.push("S");
    ops.push("BT");
    ops.push("/F2 8 Tf");
    ops.push(`${brandTerracotta} rg`);
    ops.push(`${left + 10} ${y - 12} Td`);
    ops.push("(CUSTOMER SPECIAL INSTRUCTIONS / REQUIREMENTS:) Tj");
    ops.push("ET");
    const cleanReq = escapePdfText(item.requirements.trim());
    ops.push("BT");
    ops.push("/F1 8 Tf");
    ops.push(`${darkGray} rg`);
    ops.push(`${left + 10} ${y - 24} Td`);
    ops.push(`(${cleanReq.length > 100 ? cleanReq.substring(0, 97) + "..." : cleanReq}) Tj`);
    ops.push("ET");
    y -= reqHeight;
  }
  y -= 20;
  const summaryLeft = right - 180;
  ops.push("BT");
  ops.push("/F1 9 Tf");
  ops.push(`${darkGray} rg`);
  ops.push(`${summaryLeft} ${y} Td`);
  ops.push("(Subtotal:) Tj");
  ops.push("ET");
  ops.push("BT");
  ops.push("/F2 9.5 Tf");
  ops.push(`${black} rg`);
  ops.push(`${right - 55} ${y} Td`);
  ops.push(`(Rs. ${subtotal}) Tj`);
  ops.push("ET");
  if (discount > 0) {
    y -= 14;
    ops.push("BT");
    ops.push("/F1 9 Tf");
    ops.push("0.15 0.55 0.30 rg");
    ops.push(`${summaryLeft} ${y} Td`);
    ops.push("(Promotional Discount:) Tj");
    ops.push("ET");
    ops.push("BT");
    ops.push("/F2 9.5 Tf");
    ops.push("0.15 0.55 0.30 rg");
    ops.push(`${right - 55} ${y} Td`);
    ops.push(`(-Rs. ${discount}) Tj`);
    ops.push("ET");
  }
  y -= 14;
  ops.push("BT");
  ops.push("/F1 8.5 Tf");
  ops.push(`${medGray} rg`);
  ops.push(`${summaryLeft} ${y} Td`);
  ops.push("(Delivery & Packaging:) Tj");
  ops.push("ET");
  ops.push("BT");
  ops.push("/F2 8.5 Tf");
  ops.push("0.15 0.55 0.30 rg");
  ops.push(`${right - 55} ${y} Td`);
  ops.push("(Included) Tj");
  ops.push("ET");
  y -= 10;
  ops.push(`${black} RG`);
  ops.push("1.5 w");
  ops.push(`${summaryLeft} ${y} m`);
  ops.push(`${right} ${y} l`);
  ops.push("S");
  y -= 16;
  ops.push("BT");
  ops.push("/F2 11 Tf");
  ops.push(`${black} rg`);
  ops.push(`${summaryLeft} ${y} Td`);
  ops.push("(TOTAL PAYABLE:) Tj");
  ops.push("ET");
  ops.push("BT");
  ops.push("/F2 13 Tf");
  ops.push(`${brandTerracotta} rg`);
  ops.push(`${right - 65} ${y} Td`);
  ops.push(`(Rs. ${finalAmount}) Tj`);
  ops.push("ET");
  const footerY = 70;
  ops.push(`${lightGray} RG`);
  ops.push("0.5 w");
  ops.push(`${left} ${footerY + 30} m`);
  ops.push(`${right} ${footerY + 30} l`);
  ops.push("S");
  ops.push("BT");
  ops.push("/F2 9.5 Tf");
  ops.push(`${black} rg`);
  ops.push(`${left + 160} ${footerY + 16} Td`);
  ops.push("(Thank you for choosing MomentPress!) Tj");
  ops.push("ET");
  ops.push("BT");
  ops.push("/F1 8 Tf");
  ops.push(`${darkGray} rg`);
  ops.push(`${left + 95} ${footerY + 4} Td`);
  ops.push("(Handcrafted with care by MomentPress  *  Bowbazar, Central Kolkata, West Bengal 700012) Tj");
  ops.push("ET");
  ops.push("BT");
  ops.push("/F1 8 Tf");
  ops.push(`${brandTerracotta} rg`);
  ops.push(`${left + 120} ${footerY - 8} Td`);
  ops.push(`(WhatsApp Support: +91 ${escapePdfText(studio.whatsappNumber || "7980855821")}  |  Instagram: @_rr.studio__) Tj`);
  ops.push("ET");
  const contentStream = ops.join("\n");
  const streamLength = Buffer.byteLength(contentStream, "latin1");
  const pdfChunks = [];
  const offsets = [];
  function addChunk(str) {
    const buf = Buffer.from(str, "latin1");
    const offset = pdfChunks.reduce((acc, c) => acc + c.length, 0);
    pdfChunks.push(buf);
    return offset;
  }
  addChunk("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  offsets[1] = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  addChunk("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  offsets[2] = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  addChunk("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  offsets[3] = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  addChunk("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >>\nendobj\n");
  offsets[4] = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  addChunk(`4 0 obj
<< /Length ${streamLength} >>
stream
${contentStream}
endstream
endobj
`);
  offsets[5] = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  addChunk("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n");
  offsets[6] = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  addChunk("6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n");
  offsets[7] = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  addChunk("7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>\nendobj\n");
  const xrefOffset = pdfChunks.reduce((acc, c) => acc + c.length, 0);
  let xref = "xref\n0 8\n0000000000 65535 f \n";
  for (let i = 1; i <= 7; i++) {
    xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }
  const trailer = `trailer
<< /Size 8 /Root 1 0 R >>
startxref
${xrefOffset}
%%EOF
`;
  addChunk(xref + trailer);
  return Buffer.concat(pdfChunks);
}
async function generateAndSaveBillPdf(billData, targetDir = "data/bills") {
  let effectiveDir = targetDir;
  try {
    if (!fs.existsSync(effectiveDir)) {
      fs.mkdirSync(effectiveDir, { recursive: true });
    }
  } catch (_) {
    effectiveDir = path.join(os.tmpdir(), "momentpress-bills");
    try {
      if (!fs.existsSync(effectiveDir)) {
        fs.mkdirSync(effectiveDir, { recursive: true });
      }
    } catch (_2) {
    }
  }
  const numericSuffix = String(billData.orderId || "").replace(/^MP-/i, "").trim();
  const fileName = `MomentPress-Bill-MP-${numericSuffix || billData.orderId}.pdf`;
  const filePath = path.join(effectiveDir, fileName);
  const buffer = generateBillPdfBuffer(billData);
  try {
    await fs.promises.writeFile(filePath, buffer);
  } catch (err) {
    console.warn("[PDF Generator] Local write warning:", err);
    const fallbackPath = path.join(os.tmpdir(), fileName);
    try {
      await fs.promises.writeFile(fallbackPath, buffer);
      return { filePath: fallbackPath, fileName, buffer };
    } catch (_) {
    }
  }
  return { filePath, fileName, buffer };
}

// src/lib/drive/google-drive-service.ts
var DEFAULT_BILL_FOLDER_ID = "1TB6Vfcj6AID8IR66OKcLZ7FbwYX8cPnq";
function getGoogleDriveFolderId() {
  return process.env.GOOGLE_DRIVE_FOLDER_ID && process.env.GOOGLE_DRIVE_FOLDER_ID.trim() || DEFAULT_BILL_FOLDER_ID;
}
function formatBillFileName(orderId, billNumber) {
  const numericSuffix = String(orderId || "").replace(/^MP-/i, "").trim();
  return `MomentPress-Bill-MP-${numericSuffix || orderId}.pdf`;
}
function getGoogleDriveAuthType() {
  if (process.env.GOOGLE_DRIVE_CLIENT_ID && process.env.GOOGLE_DRIVE_REFRESH_TOKEN) {
    return "OAUTH_REFRESH_TOKEN";
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY && process.env.GOOGLE_SERVICE_ACCOUNT_KEY.trim() || process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_APPLICATION_CREDENTIALS.trim()) {
    return "SERVICE_ACCOUNT";
  }
  return "NONE";
}
function buildMultipartBody(metadata, fileBuffer, boundary = "-------MomentPressDriveBoundary" + Date.now()) {
  const delimiter = `\r
--${boundary}\r
`;
  const closeDelimiter = `\r
--${boundary}--`;
  const metadataPart = delimiter + "Content-Type: application/json; charset=UTF-8\r\n\r\n" + JSON.stringify(metadata) + delimiter + "Content-Type: application/pdf\r\n\r\n";
  const metadataBuffer = Buffer.from(metadataPart, "utf8");
  const closeBuffer = Buffer.from(closeDelimiter, "utf8");
  return {
    body: Buffer.concat([metadataBuffer, fileBuffer, closeBuffer]),
    boundary
  };
}
async function uploadBillToGoogleDrive(params) {
  const folderId = getGoogleDriveFolderId();
  const folderPath = `Google Drive Folder (${folderId})`;
  const fileName = params.fileName || formatBillFileName(params.orderId);
  if (!params.forceReupload && params.existingFileId && params.existingDriveUrl) {
    return {
      status: "VERIFIED",
      message: "Reused existing Google Drive bill file (duplicate upload prevented).",
      folderPath,
      folderId,
      fileName,
      fileId: params.existingFileId,
      webViewLink: params.existingDriveUrl,
      webContentLink: params.existingDownloadUrl,
      uploadedAt: params.existingUploadedAt || (/* @__PURE__ */ new Date()).toISOString(),
      reused: true
    };
  }
  const authType = getGoogleDriveAuthType();
  if (authType === "NONE") {
    const hasClientId = Boolean(process.env.GOOGLE_DRIVE_CLIENT_ID?.trim());
    const detailMsg = hasClientId ? `Google Drive OAuth Client ID is configured, but GOOGLE_DRIVE_REFRESH_TOKEN is missing. Generate and add GOOGLE_DRIVE_REFRESH_TOKEN to .env.` : `Google Drive credentials are not configured. Target folder ID configured: ${folderId}. Set GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, and GOOGLE_DRIVE_REFRESH_TOKEN (or Service Account) in .env for automatic cloud upload.`;
    return {
      status: "BLOCKED_CONFIG_REQUIRED",
      message: detailMsg,
      folderPath,
      folderId,
      fileName
    };
  }
  try {
    let accessToken = null;
    const { GoogleAuth, OAuth2Client } = await import("google-auth-library");
    if (authType === "OAUTH_REFRESH_TOKEN") {
      const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID?.trim();
      const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET?.trim();
      const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim();
      const oauth2Client = new OAuth2Client(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const tokenResponse = await oauth2Client.getAccessToken();
      accessToken = tokenResponse?.token;
      if (!accessToken) {
        return {
          status: "ERROR",
          message: "Failed to acquire access token from Google Drive OAuth refresh token. Verify GOOGLE_DRIVE_REFRESH_TOKEN, CLIENT_ID, and CLIENT_SECRET.",
          folderPath,
          folderId,
          fileName
        };
      }
    } else if (authType === "SERVICE_ACCOUNT") {
      let auth = null;
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        let credentials;
        try {
          credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        } catch (jsonErr) {
          return {
            status: "ERROR",
            message: `Invalid GOOGLE_SERVICE_ACCOUNT_KEY JSON format: ${jsonErr?.message || jsonErr}`,
            folderPath,
            folderId,
            fileName
          };
        }
        auth = new GoogleAuth({
          credentials,
          scopes: ["https://www.googleapis.com/auth/drive.file"]
        });
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        auth = new GoogleAuth({
          keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          scopes: ["https://www.googleapis.com/auth/drive.file"]
        });
      }
      if (!auth) {
        return {
          status: "BLOCKED_CONFIG_REQUIRED",
          message: "Google Drive Service Account credentials not recognized.",
          folderPath,
          folderId,
          fileName
        };
      }
      const client = await auth.getClient();
      const tokenResponse = await client.getAccessToken();
      accessToken = tokenResponse?.token;
      if (!accessToken) {
        return {
          status: "ERROR",
          message: "Failed to acquire access token from Google Service Account credentials.",
          folderPath,
          folderId,
          fileName
        };
      }
    }
    if (!accessToken) {
      return {
        status: "BLOCKED_CONFIG_REQUIRED",
        message: "Unable to authenticate with Google Drive API.",
        folderPath,
        folderId,
        fileName
      };
    }
    const authHeaders = {
      Authorization: `Bearer ${accessToken}`
    };
    if (!params.forceReupload) {
      const escapedFileName = fileName.replace(/'/g, "\\'");
      const legacyFileName = `MomentPress-Bill-${params.orderId}.pdf`.replace(/'/g, "\\'");
      const searchQuery = encodeURIComponent(
        `'${folderId}' in parents and (name = '${escapedFileName}' or name = '${legacyFileName}') and trashed = false`
      );
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${searchQuery}&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=files(id,name,webViewLink,webContentLink)`,
        { headers: authHeaders }
      );
      if (searchRes.ok) {
        const searchJson = await searchRes.json();
        const existing = searchJson.files && searchJson.files[0];
        if (existing && existing.id) {
          try {
            await fetch(`https://www.googleapis.com/drive/v3/files/${existing.id}/permissions?supportsAllDrives=true`, {
              method: "POST",
              headers: { ...authHeaders, "Content-Type": "application/json" },
              body: JSON.stringify({ role: "reader", type: "anyone" })
            });
          } catch {
          }
          const webViewLink2 = existing.webViewLink || `https://drive.google.com/file/d/${existing.id}/view?usp=sharing`;
          const webContentLink2 = existing.webContentLink || `https://drive.google.com/uc?id=${existing.id}&export=download`;
          return {
            status: "VERIFIED",
            message: "Existing Google Drive bill found in folder and reused (duplicate upload prevented).",
            folderPath,
            folderId,
            fileName: existing.name || fileName,
            fileId: existing.id,
            webViewLink: webViewLink2,
            webContentLink: webContentLink2,
            uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
            reused: true
          };
        }
      }
    }
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
      description: `MomentPress Official Customer Invoice for Order ${params.orderId}`
    };
    const { body: multipartData, boundary } = buildMultipartBody(fileMetadata, params.pdfBuffer);
    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink,webContentLink",
      {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": `multipart/related; boundary=${boundary}`,
          "Content-Length": String(multipartData.length)
        },
        body: multipartData
      }
    );
    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      let parsedErr = errText;
      try {
        const parsed = JSON.parse(errText);
        parsedErr = parsed?.error?.message || errText;
      } catch {
      }
      if (uploadRes.status === 404 || uploadRes.status === 403) {
        return {
          status: "ERROR",
          message: `Google Drive upload blocked: Folder ${folderId} is not accessible. Please ensure folder is valid and shared with the authenticated account. Details: ${parsedErr}`,
          folderPath,
          folderId,
          fileName
        };
      }
      return {
        status: "ERROR",
        message: `Google Drive upload failed (HTTP ${uploadRes.status}): ${parsedErr}`,
        folderPath,
        folderId,
        fileName
      };
    }
    const uploadJson = await uploadRes.json();
    const fileId = uploadJson.id;
    if (fileId) {
      try {
        const permRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`, {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            role: "reader",
            type: "anyone"
          })
        });
        if (!permRes.ok) {
          const permErr = await permRes.text();
          console.warn(`[Google Drive] Setting public link permission note for ${fileId}:`, permErr);
        }
      } catch (permErr) {
        console.warn(`[Google Drive] Setting public link permission error:`, permErr?.message || permErr);
      }
    }
    const webViewLink = uploadJson.webViewLink || `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    const webContentLink = uploadJson.webContentLink || `https://drive.google.com/uc?id=${fileId}&export=download`;
    return {
      status: "VERIFIED",
      message: "Invoice successfully uploaded to Google Drive.",
      folderPath,
      folderId,
      fileName,
      fileId,
      webViewLink,
      webContentLink,
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
      reused: false
    };
  } catch (error) {
    return {
      status: "ERROR",
      message: `Google Drive upload error: ${error?.message || error}`,
      folderPath,
      folderId,
      fileName
    };
  }
}

// src/lib/sheets/google-sheets-sync.ts
function deriveOrderDimensions(productName, sizeName, frameSizes) {
  if (!sizeName) return "";
  const rawSize = String(sizeName).trim();
  const lowerSize = rawSize.toLowerCase();
  if (Array.isArray(frameSizes)) {
    const matched = frameSizes.find((fs3) => {
      const fsId = String(fs3.id || "").toLowerCase();
      const fsName = String(fs3.name || "").toLowerCase();
      return fsId === lowerSize || fsName === lowerSize || fsName.replace(/[×x]/g, "x") === lowerSize.replace(/[×x]/g, "x");
    });
    if (matched && matched.dimensions) {
      return matched.dimensions;
    }
  }
  const cleanKey = lowerSize.replace(/[×x]/g, "x").replace(/[^0-9x]/g, "");
  const staticMap = {
    "5x7": "15 x 20 cm (5x7 in)",
    // wait, 5x7 is 13 x 18 cm
    "6x8": "15 x 20 cm (6x8 in)",
    "8x10": "20 x 25 cm (8x10 in)",
    "10x12": "25 x 30 cm (10x12 in)",
    "12x18": "30 x 45 cm (12x18 in)",
    "2x2": "5 x 5 cm (2x2 in)",
    "3x3": "7.6 x 7.6 cm (3x3 in)",
    "4x4": "10 x 10 cm (4x4 in)"
  };
  staticMap["5x7"] = "13 x 18 cm (5x7 in)";
  if (staticMap[cleanKey]) {
    return staticMap[cleanKey];
  }
  return rawSize;
}
function mapOrderToSheetRow(order, frameSizes) {
  const quantity = Number(order.quantity) || 1;
  const unitPrice = Number(order.unitPrice) || 0;
  const subtotal = unitPrice * quantity;
  const discount = Number(order.discount) || 0;
  const finalTotal = Number(order.finalAmount) || subtotal - discount;
  const address = order.address ? String(order.address).trim() : "";
  const city = order.city ? String(order.city).trim() : "Kolkata";
  const pincode = order.pincode ? String(order.pincode).trim() : "";
  const formattedAddress = pincode ? `${address}, ${city} - ${pincode}` : address ? `${address}, ${city}` : city;
  return {
    "Order ID": String(order.id || ""),
    "Order Date": String(order.createdDate || order.orderDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]),
    "Customer Name": String(order.customerName || ""),
    "WhatsApp": String(order.mobileNumber || ""),
    "Delivery Address": formattedAddress,
    "Product": String(order.product || ""),
    "Size": String(order.size || ""),
    "Dimensions": deriveOrderDimensions(order.product, order.size, frameSizes),
    "Quality": String(order.quality || ""),
    "Quantity": quantity,
    "Requirements": String(order.requirements || ""),
    "Subtotal": subtotal,
    "Discount": discount,
    "Final Total": finalTotal,
    "Order Status": String(order.orderStatus || "Pending"),
    "Bill Number": String(order.billNumber || ""),
    "Bill Drive Link": String(order.billDriveUrl || ""),
    "Bill Generated At": String(order.billGeneratedAt || "")
  };
}
function mapUpdatesToSheetFields(updates) {
  const mapped = {};
  const allowedColumns = /* @__PURE__ */ new Set([
    "Order Date",
    "Customer Name",
    "WhatsApp",
    "Delivery Address",
    "Product",
    "Size",
    "Dimensions",
    "Quality",
    "Quantity",
    "Requirements",
    "Subtotal",
    "Discount",
    "Final Total",
    "Order Status",
    "Bill Number",
    "Bill Drive Link",
    "Bill Generated At"
  ]);
  for (const [key, value] of Object.entries(updates)) {
    if (key === "Order ID" || key === "id" || key === "orderId") {
      continue;
    }
    if (allowedColumns.has(key)) {
      mapped[key] = value;
      continue;
    }
    switch (key) {
      case "orderStatus":
        mapped["Order Status"] = value;
        break;
      case "billNumber":
        mapped["Bill Number"] = value;
        break;
      case "billDriveUrl":
        mapped["Bill Drive Link"] = value;
        break;
      case "billGeneratedAt":
        mapped["Bill Generated At"] = value;
        break;
      case "customerName":
        mapped["Customer Name"] = value;
        break;
      case "mobileNumber":
        mapped["WhatsApp"] = value;
        break;
      case "requirements":
        mapped["Requirements"] = value;
        break;
      case "quality":
        mapped["Quality"] = value;
        break;
      case "size":
        mapped["Size"] = value;
        break;
      case "quantity":
        mapped["Quantity"] = Number(value);
        break;
      case "unitPrice":
        if (updates.quantity) {
          mapped["Subtotal"] = Number(value) * Number(updates.quantity);
        }
        break;
      case "discount":
        mapped["Discount"] = Number(value);
        break;
      case "finalAmount":
        mapped["Final Total"] = Number(value);
        break;
      case "address":
      case "city":
      case "pincode":
        if (updates.address || updates.city || updates.pincode) {
          const addr = updates.address || "";
          const c = updates.city || "Kolkata";
          const pin = updates.pincode || "";
          mapped["Delivery Address"] = pin ? `${addr}, ${c} - ${pin}` : `${addr}, ${c}`;
        }
        break;
    }
  }
  return mapped;
}
async function postToAppsScript(payload, orderIdForLog) {
  const webAppUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  const secret = process.env.GOOGLE_SHEETS_SYNC_SECRET;
  if (!webAppUrl || !webAppUrl.trim()) {
    console.warn("[Google Sheets] Sync skipped: GOOGLE_SHEETS_WEBAPP_URL not configured");
    return { success: false, error: "GOOGLE_SHEETS_WEBAPP_URL not configured" };
  }
  if (!secret || !secret.trim()) {
    console.warn("[Google Sheets] Sync skipped: GOOGLE_SHEETS_SYNC_SECRET not configured");
    return { success: false, error: "GOOGLE_SHEETS_SYNC_SECRET not configured" };
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5e3);
  try {
    const bodyToSend = JSON.stringify({
      ...payload,
      secret
    });
    const response = await fetch(webAppUrl.trim(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: bodyToSend,
      redirect: "follow",
      // Follow 302 redirect from Google Apps Script
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      console.warn(`[Google Sheets] HTTP error ${response.status} for order: ${orderIdForLog || "unknown"}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
    const data = await response.json();
    if (data && data.success === true) {
      return {
        success: true,
        created: Boolean(data.created),
        duplicate: Boolean(data.duplicate),
        updated: Boolean(data.updated),
        orderId: data.orderId || orderIdForLog
      };
    }
    console.warn(`[Google Sheets] API reported failure for order ${orderIdForLog || "unknown"}: ${data?.error || data?.message || "Unknown error"}`);
    return {
      success: false,
      error: data?.error || data?.message || "Apps Script returned success: false"
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      console.warn(`[Google Sheets] Sync timed out after 5s for order: ${orderIdForLog || "unknown"}`);
      return { success: false, error: "Request timeout" };
    }
    console.warn(`[Google Sheets] Sync network error for order ${orderIdForLog || "unknown"}: ${err?.message || err}`);
    return { success: false, error: err?.message || "Network error" };
  }
}
async function appendOrderToSheet(order, frameSizes) {
  try {
    if (!order || !order.id) {
      return { success: false, error: "Invalid order object" };
    }
    const sheetRow = mapOrderToSheetRow(order, frameSizes);
    const payload = {
      action: "createOrder",
      order: sheetRow
    };
    return await postToAppsScript(payload, order.id);
  } catch (err) {
    console.warn(`[Google Sheets] Unexpected error appending order ${order?.id || "unknown"}: ${err?.message || err}`);
    return { success: false, error: err?.message || "Unexpected error" };
  }
}
async function updateOrderInSheet(orderId, updates) {
  try {
    if (!orderId) {
      return { success: false, error: "Missing orderId" };
    }
    const sheetUpdates = mapUpdatesToSheetFields(updates);
    if (Object.keys(sheetUpdates).length === 0) {
      return { success: true };
    }
    const payload = {
      action: "updateOrder",
      orderId: String(orderId),
      updates: sheetUpdates
    };
    return await postToAppsScript(payload, orderId);
  } catch (err) {
    console.warn(`[Google Sheets] Unexpected error updating order ${orderId}: ${err?.message || err}`);
    return { success: false, error: err?.message || "Unexpected error" };
  }
}

// server.ts
dotenv.config();
var app = express();
var args = process.argv.slice(2);
var portIndex = args.indexOf("--port");
var cliPort = portIndex !== -1 && args[portIndex + 1] ? parseInt(args[portIndex + 1], 10) : null;
var PORT = cliPort || (process.env.NODE_ENV === "production" && process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3);
var isProduction = process.env.NODE_ENV === "production";
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https: ws: wss:; frame-ancestors *;"
  );
  if (req.path.startsWith("/admin") || req.path.startsWith("/api") || req.path.startsWith("/order")) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  next();
});
app.get("/robots.txt", (req, res) => {
  const robotsTxt = `# MomentPress Studio - Technical SEO Robots Directives
User-agent: *
Allow: /
Allow: /custom-photo-frames
Allow: /photo-stickers
Allow: /existing-designs
Allow: /faq
Allow: /contact

# Private Admin, Orders and API Routes
Disallow: /admin/
Disallow: /api/
Disallow: /order/

# XML Sitemap
Sitemap: https://momentpress.ai.studio/sitemap.xml
`;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(robotsTxt);
});
app.get("/sitemap.xml", (req, res) => {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const publicRoutes = [
    { loc: "https://momentpress.ai.studio/", priority: "1.0" },
    { loc: "https://momentpress.ai.studio/custom-photo-frames", priority: "0.9" },
    { loc: "https://momentpress.ai.studio/photo-stickers", priority: "0.9" },
    { loc: "https://momentpress.ai.studio/existing-designs", priority: "0.8" },
    { loc: "https://momentpress.ai.studio/faq", priority: "0.7" },
    { loc: "https://momentpress.ai.studio/contact", priority: "0.7" }
  ];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  for (const r of publicRoutes) {
    xml += `  <url>
`;
    xml += `    <loc>${r.loc}</loc>
`;
    xml += `    <lastmod>${today}</lastmod>
`;
    xml += `  </url>
`;
  }
  xml += `</urlset>`;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(xml);
});
app.use(express.json({ limit: "10mb" }));
function resolveDataDir() {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const localDir = path2.resolve(process.cwd(), "data");
  if (!isServerless) {
    try {
      if (!fs2.existsSync(localDir)) {
        fs2.mkdirSync(localDir, { recursive: true });
      }
      const testFile = path2.join(localDir, `.writetest-${Date.now()}`);
      fs2.writeFileSync(testFile, "ok");
      fs2.unlinkSync(testFile);
      return localDir;
    } catch (_) {
    }
  }
  const tmpDir = path2.join(os2.tmpdir(), "momentpress-data");
  try {
    if (!fs2.existsSync(tmpDir)) {
      fs2.mkdirSync(tmpDir, { recursive: true });
    }
    return tmpDir;
  } catch (_) {
    return os2.tmpdir();
  }
}
var DATA_DIR = resolveDataDir();
var DATA_FILE = path2.join(DATA_DIR, "momentpress-store.json");
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1e5, 64, "sha512").toString("hex");
}
function generateSecureToken() {
  return crypto.randomBytes(32).toString("hex");
}
function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}
var loginAttemptsMap = /* @__PURE__ */ new Map();
var MAX_FAILED_ATTEMPTS = 5;
var BLOCK_DURATION_MS = 15 * 60 * 1e3;
var orderRateLimitMap = /* @__PURE__ */ new Map();
var MAX_ORDERS_PER_WINDOW = 60;
var ORDER_WINDOW_MS = 5 * 60 * 1e3;
var billRateLimitMap = /* @__PURE__ */ new Map();
var MAX_BILLS_PER_WINDOW = 120;
var BILL_WINDOW_MS = 5 * 60 * 1e3;
function getClientIp(req) {
  try {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.trim()) {
      return forwarded.split(",")[0].trim();
    }
    const realIp = req.headers["x-real-ip"];
    if (typeof realIp === "string" && realIp.trim()) {
      return realIp.trim();
    }
    if (req.socket && req.socket.remoteAddress) {
      return req.socket.remoteAddress;
    }
  } catch (_) {
  }
  return "unknown-ip";
}
function createInitialStore() {
  const initialUsername = process.env.ADMIN_USERNAME || "admin@momentpress.in";
  const envPassword = process.env.ADMIN_PASSWORD;
  const hasEnvPassword = Boolean(envPassword && envPassword.trim());
  const salt = hasEnvPassword ? generateSalt() : "";
  const hash = hasEnvPassword ? hashPassword(envPassword.trim(), salt) : "";
  return {
    adminCredentials: {
      username: initialUsername,
      passwordSalt: salt,
      passwordHash: hash,
      needsSetup: !hasEnvPassword,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    sessions: [],
    nextOrderNumber: 1,
    onlineOrders: [],
    offlineSales: [],
    customers: [],
    inventory: [...DEFAULT_INVENTORY_ITEMS],
    productMappings: [...DEFAULT_PRODUCT_MAPPINGS],
    stockMovements: [],
    purchases: [],
    expenses: [],
    activityLog: [],
    reviews: [],
    products: [
      {
        id: "custom-photo-frames",
        name: "Custom Photo Frames",
        type: "frame",
        description: "Handcrafted solid wood frames with crystal protective glass and archival photo paper.",
        originalStartingPrice: 199,
        discountedStartingPrice: null,
        discountPercentage: null,
        discountActive: false,
        startingPrice: 199,
        active: true,
        displayOrder: 1,
        features: [
          "High-definition archival photo printing included",
          "Handcrafted solid wood mouldings in 4 finishes",
          "Crystal clear protective glass with anti-glare finish",
          "Dual orientation hanging hardware & desk stand",
          "Free digital WhatsApp proof before print production"
        ]
      },
      {
        id: "photo-stickers",
        name: "Custom Photo Stickers",
        type: "sticker",
        description: "Waterproof matte vinyl die-cut personal stickers for phones, laptops, and diaries.",
        originalStartingPrice: 99,
        discountedStartingPrice: null,
        discountPercentage: null,
        discountActive: false,
        startingPrice: 99,
        active: true,
        displayOrder: 2,
        features: [
          "Weatherproof & scratch-resistant vinyl lamination",
          "High-resolution vibrant pigment printing",
          "Clean peeling adhesive leaves zero sticky residue",
          "Available in Small (2\xD72), Medium (3\xD73) & Large (4\xD74)",
          "Delivered in protective hardboard packaging"
        ]
      }
    ],
    frameSizes: [
      {
        id: "5x7",
        name: "5\xD77 in",
        dimensions: "13 \xD7 18 cm (5\xD77 in)",
        originalPrice: 199,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        basePrice: 199,
        aspectRatio: "5:7",
        recommendedFor: "Desk, Workstation & Nightstand",
        active: true,
        displayOrder: 1,
        popular: false
      },
      {
        id: "6x8",
        name: "6\xD78 in",
        dimensions: "15 \xD7 20 cm (6\xD78 in)",
        originalPrice: 249,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        basePrice: 249,
        aspectRatio: "3:4",
        recommendedFor: "Shelves, Bookcases & Gifting",
        active: true,
        displayOrder: 2,
        popular: true,
        badge: "Most Popular"
      },
      {
        id: "8x10",
        name: "8\xD710 in",
        dimensions: "20 \xD7 25 cm (8\xD710 in)",
        originalPrice: 349,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        basePrice: 349,
        aspectRatio: "4:5",
        recommendedFor: "Gallery Walls & Bedside Table",
        active: true,
        displayOrder: 3,
        popular: false
      },
      {
        id: "10x12",
        name: "10\xD712 in",
        dimensions: "25 \xD7 30 cm (10\xD712 in)",
        originalPrice: 449,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        basePrice: 449,
        aspectRatio: "5:6",
        recommendedFor: "Living Room Feature Walls",
        active: true,
        displayOrder: 4,
        popular: false
      },
      {
        id: "12x18",
        name: "12\xD718 in",
        dimensions: "30 \xD7 45 cm (12\xD718 in)",
        originalPrice: 599,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        basePrice: 599,
        aspectRatio: "2:3",
        recommendedFor: "Statement Centerpieces & Landscapes",
        active: true,
        displayOrder: 5,
        popular: false
      }
    ],
    qualityTiers: [
      {
        id: "good",
        name: "Standard Luster",
        description: "Crisp vibrant prints on 240 GSM resin-coated photo paper with rich color fidelity.",
        paperType: "240 GSM Resin-Coated Paper",
        finish: "Subtle Pearl Luster",
        longevity: "25+ Years Display Life",
        originalPriceDelta: 0,
        discountedPriceDelta: null,
        discountActive: false,
        priceAdjustment: 0,
        active: true,
        displayOrder: 1
      },
      {
        id: "better",
        name: "Studio Velvet",
        description: "Deep contrast and rich blacks on 280 GSM premium satin photographic paper.",
        paperType: "280 GSM Premium Satin Paper",
        finish: "Silky Matte Finish",
        longevity: "50+ Years Display Life",
        originalPriceDelta: 50,
        discountedPriceDelta: null,
        discountActive: false,
        priceAdjustment: 50,
        active: true,
        displayOrder: 2,
        popular: true,
        badge: "Recommended"
      },
      {
        id: "best",
        name: "Archival Fine Art",
        description: "Museum-grade 310 GSM 100% cotton rag paper with pigment-based archival inks.",
        paperType: "310 GSM 100% Cotton Rag",
        finish: "Museum Velvet Matte",
        longevity: "100+ Years Archival Quality",
        originalPriceDelta: 100,
        discountedPriceDelta: null,
        discountActive: false,
        priceAdjustment: 100,
        active: true,
        displayOrder: 3,
        badge: "Heirloom"
      }
    ],
    stickerSizes: [
      {
        id: "Small",
        name: "Small (2\xD72 in)",
        description: "Compact vinyl stickers for phone cases, earbuds & mini items",
        originalPrice: 99,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        price: 99,
        active: true,
        displayOrder: 1
      },
      {
        id: "Medium",
        name: "Medium (3\xD73 in)",
        description: "Versatile size for laptops, water bottles & diaries",
        originalPrice: 149,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        price: 149,
        active: true,
        displayOrder: 2
      },
      {
        id: "Large",
        name: "Large (4\xD74 in)",
        description: "Statement vinyl decal for notebooks, boards & tech gear",
        originalPrice: 199,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        price: 199,
        active: true,
        displayOrder: 3
      }
    ],
    existingDesigns: [
      {
        id: "gal-1",
        title: "Golden Hour Portrait",
        name: "Golden Hour Portrait",
        category: "Portraits & Milestones",
        size: "8\xD710 in",
        finish: "natural-oak",
        description: "Printed on Studio Velvet satin paper with a hand-waxed natural oak border.",
        active: true,
        displayOrder: 1
      },
      {
        id: "gal-2",
        title: "Darjeeling Tea Garden View",
        name: "Darjeeling Tea Garden View",
        category: "Landscapes & Travel",
        size: "12\xD718 in",
        finish: "classic-black",
        description: "Statement size landscape with Archival Fine Art cotton paper and anti-glare glass.",
        active: true,
        displayOrder: 2
      },
      {
        id: "gal-3",
        title: "Kolkata Yellow Taxi Heritage",
        name: "Kolkata Yellow Taxi Heritage",
        category: "Architecture & Street",
        size: "6\xD78 in",
        finish: "warm-walnut",
        description: "Warm walnut frame complementing rich amber city hues.",
        active: true,
        displayOrder: 3
      },
      {
        id: "gal-4",
        title: "Family Reunion Milestone",
        name: "Family Reunion Milestone",
        category: "Family Memories",
        size: "10\xD712 in",
        finish: "warm-walnut",
        description: "Classic heirloom frame commemorating three generations together.",
        active: true,
        displayOrder: 4
      },
      {
        id: "gal-5",
        title: "Minimalist Botanical Study",
        name: "Minimalist Botanical Study",
        category: "Minimalist & Flora",
        size: "8\xD710 in",
        finish: "gallery-white",
        description: "Bright contemporary white profile paired with crisp 240 GSM Luster print.",
        active: true,
        displayOrder: 5
      },
      {
        id: "gal-6",
        title: "Pet Companion Memory",
        name: "Pet Companion Memory",
        category: "Pets & Companions",
        size: "6\xD78 in",
        finish: "classic-black",
        description: "Compact shelf display with deep shadowline black profile.",
        active: true,
        displayOrder: 6
      }
    ],
    faqs: [
      {
        id: "faq-1",
        question: "How do I send my photo for custom framing or stickers?",
        answer: 'Once you configure your size and options, click "Send Photos on WhatsApp" on the confirmation screen. You can simply attach your full-resolution image directly to our chat thread. Our team inspects every image for sharpness and resolution.',
        active: true,
        displayOrder: 1
      },
      {
        id: "faq-2",
        question: "Will I see how my photo looks before it is printed?",
        answer: "Yes, absolutely. We generate a 100% free digital mock-up preview via WhatsApp showing the exact cropping, borders, and color tone. Printing begins only after you review and explicitly approve the preview.",
        active: true,
        displayOrder: 2
      },
      {
        id: "faq-3",
        question: "What is the standard turnaround time in Kolkata?",
        answer: "Orders in Kolkata are handcrafted in our Bowbazar studio and delivered within 24 to 48 hours of your proof approval. We use reinforced tamper-proof packaging to ensure safe arrival.",
        active: true,
        displayOrder: 3
      },
      {
        id: "faq-4",
        question: "What kind of paper and printing technology do you use?",
        answer: "We use professional 12-color archival pigment printers with genuine pigment inks. Paper options range from 240 GSM Luster for rich contrast, to 280 GSM Studio Velvet, and 310 GSM 100% cotton museum rag that lasts over a century.",
        active: true,
        displayOrder: 4
      },
      {
        id: "faq-5",
        question: "Are the photo stickers waterproof and residue-free?",
        answer: "Yes! Our custom photo stickers are printed on durable vinyl with a protective matte lamination that makes them resistant to water, spills, and UV sunlight. When removed, they leave zero sticky residue on laptops, phone cases, or tumblers.",
        active: true,
        displayOrder: 5
      },
      {
        id: "faq-6",
        question: "What if my package arrives damaged in transit?",
        answer: "Contact MomentPress as soon as possible with the relevant order details and photos of the package/product so the issue can be reviewed and resolved according to the applicable policy.",
        active: true,
        displayOrder: 6
      }
    ],
    offers: [],
    websiteSettings: {
      studioName: "MomentPress",
      tagline: "Your Photos. Your Story. Your Frame.",
      heroHeadline: "Your memory, beautifully framed.",
      heroSubheadline: "Handmade in Bowbazar, Kolkata using sustainably harvested solid wood mouldings, crystal glass, and archival pigment papers.",
      currency: "INR",
      phone: "6291681660",
      whatsappNumber: "7980855821",
      email: "connect.rrstudio@gmail.com",
      instagramHandle: "@_rr.studio__",
      instagramUrl: "https://www.instagram.com/_rr.studio__/",
      address: "Bowbazar, Central Kolkata, West Bengal 700012",
      city: "Kolkata",
      deliveryPromiseHours: 48,
      startingFramePrice: 199,
      startingStickerPrice: 99
    },
    whatsappTemplates: [
      {
        id: "tmpl-order",
        title: "New Customer Order",
        category: "Order Request",
        templateText: "Hello MomentPress!\n\nI have placed an order request:\nOrder ID: {orderId}\nCustomer: {customerName}\nProduct: {productName}\nSize: {sizeName}\nQuantity: {quantity}\nTotal Amount: \u20B9{totalPrice}\n\nI am attaching my photo(s) here for the free digital proof.",
        variables: ["orderId", "customerName", "productName", "sizeName", "quantity", "totalPrice"]
      },
      {
        id: "tmpl-proof",
        title: "Proof Ready Notification",
        category: "Design Preview",
        templateText: 'Hello {customerName}! Here is the digital proof preview for your MomentPress Order #{orderId}. Please review the crop, margins, and paper texture. Reply "APPROVED" to begin printing.',
        variables: ["customerName", "orderId"]
      },
      {
        id: "tmpl-dispatch",
        title: "Order Dispatched Update",
        category: "Delivery Update",
        templateText: "Great news {customerName}! Your handcrafted MomentPress Order #{orderId} has been carefully packaged and is out for delivery. Estimated arrival: today.",
        variables: ["customerName", "orderId"]
      }
    ],
    homepageHero: {
      heading: "Your memory, beautifully framed.",
      subheading: "Turn your favorite moments into beautiful personalized frames and photo products.",
      hookBadgeText: "Starting from just \u20B999",
      ctaText: "Create Your Frame",
      ctaLink: "#products",
      secondaryCtaText: "Existing Designs",
      secondaryCtaLink: "#existing-designs",
      visible: true
    },
    homepageSections: [
      { id: "hero", name: "Hero Banner", description: "Main headline, tagline, starting prices & CTA buttons", visible: true, displayOrder: 1 },
      { id: "trust", name: "Trust Indicators", description: "Free digital proof, anti-glare glass & 48h delivery badges", visible: true, displayOrder: 2 },
      { id: "products", name: "Products & Frame Customizer", description: "Product cards and interactive sizing & customization workspace", visible: true, displayOrder: 3 },
      { id: "how-it-works", name: "How It Works", description: "4-step simple order guide (Select, WhatsApp, Proof, Delivery)", visible: true, displayOrder: 4 },
      { id: "existing-designs", name: "Existing Designs Showcase Banner", description: "Curated gallery link banner inviting customers to explore designs", visible: true, displayOrder: 5 },
      { id: "reviews", name: "Customer Reviews", description: "Verified customer feedback and testimonials across Kolkata", visible: true, displayOrder: 6 },
      { id: "faq", name: "Frequently Asked Questions", description: "Answers to common framing, printing, and delivery questions", visible: true, displayOrder: 7 },
      { id: "final-cta", name: "Final Conversion CTA", description: "Bottom call-to-action banner driving frame customization", visible: true, displayOrder: 8 }
    ]
  };
}
var BACKUP_FILE = path2.join(DATA_DIR, "momentpress-store.json.backup");
var store = (function loadStore() {
  const tryParse = (filePath) => {
    try {
      if (fs2.existsSync(filePath)) {
        const content = fs2.readFileSync(filePath, "utf-8");
        if (content && content.trim()) {
          return JSON.parse(content);
        }
      }
    } catch (e) {
      console.warn(`Failed reading store from ${filePath}:`, e);
    }
    return null;
  };
  let parsed = tryParse(DATA_FILE);
  if (!parsed && fs2.existsSync(BACKUP_FILE)) {
    console.warn(`Attempting recovery from backup store: ${BACKUP_FILE}`);
    parsed = tryParse(BACKUP_FILE);
  }
  if (!parsed) {
    const seedFile = path2.resolve(process.cwd(), "data", "momentpress-store.json");
    if (fs2.existsSync(seedFile)) {
      parsed = tryParse(seedFile);
    }
  }
  if (parsed) {
    const now = Date.now();
    parsed.sessions = (parsed.sessions || []).filter((s) => s.expiresAt > now);
    if (!parsed.adminCredentials || !parsed.adminCredentials.passwordHash) {
      if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim()) {
        const envPassword = process.env.ADMIN_PASSWORD.trim();
        const salt = generateSalt();
        parsed.adminCredentials = {
          username: process.env.ADMIN_USERNAME || parsed.adminCredentials?.username || "admin",
          passwordSalt: salt,
          passwordHash: hashPassword(envPassword, salt),
          needsSetup: false,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      } else {
        parsed.adminCredentials = {
          username: process.env.ADMIN_USERNAME || parsed.adminCredentials?.username || "admin",
          passwordSalt: "",
          passwordHash: "",
          needsSetup: true,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
    }
    if (!parsed.productMappings || !Array.isArray(parsed.productMappings) || parsed.productMappings.length === 0) {
      parsed.productMappings = [...DEFAULT_PRODUCT_MAPPINGS];
    }
    if (!parsed.inventory || !Array.isArray(parsed.inventory) || parsed.inventory.length === 0) {
      parsed.inventory = [...DEFAULT_INVENTORY_ITEMS];
    }
    if (!parsed.homepageHero) {
      parsed.homepageHero = {
        heading: "Your memory, beautifully framed.",
        subheading: "Turn your favorite moments into beautiful personalized frames and photo products.",
        hookBadgeText: "Starting from just \u20B999",
        ctaText: "Create Your Frame",
        ctaLink: "#products",
        secondaryCtaText: "Existing Designs",
        secondaryCtaLink: "#existing-designs",
        visible: true
      };
    } else if (parsed.homepageHero.heading === "Handcrafted Keepsake Frames Made for Your Memories") {
      parsed.homepageHero.heading = "Your memory, beautifully framed.";
    }
    if (parsed.websiteSettings && parsed.websiteSettings.heroHeadline === "Handcrafted Keepsake Frames Made for Your Memories") {
      parsed.websiteSettings.heroHeadline = "Your memory, beautifully framed.";
    }
    if (!parsed.homepageSections || !Array.isArray(parsed.homepageSections) || parsed.homepageSections.length === 0) {
      parsed.homepageSections = [
        { id: "hero", name: "Hero Banner", description: "Main headline, tagline, starting prices & CTA buttons", visible: true, displayOrder: 1 },
        { id: "trust", name: "Trust Indicators", description: "Free digital proof, anti-glare glass & 48h delivery badges", visible: true, displayOrder: 2 },
        { id: "products", name: "Products & Frame Customizer", description: "Product cards and interactive sizing & customization workspace", visible: true, displayOrder: 3 },
        { id: "how-it-works", name: "How It Works", description: "4-step simple order guide (Select, WhatsApp, Proof, Delivery)", visible: true, displayOrder: 4 },
        { id: "existing-designs", name: "Existing Designs Showcase Banner", description: "Curated gallery link banner inviting customers to explore designs", visible: true, displayOrder: 5 },
        { id: "reviews", name: "Customer Reviews", description: "Verified customer feedback and testimonials across Kolkata", visible: true, displayOrder: 6 },
        { id: "faq", name: "Frequently Asked Questions", description: "Answers to common framing, printing, and delivery questions", visible: true, displayOrder: 7 },
        { id: "final-cta", name: "Final Conversion CTA", description: "Bottom call-to-action banner driving frame customization", visible: true, displayOrder: 8 }
      ];
    }
    if (typeof parsed.nextOrderNumber !== "number") {
      let maxExisting = 0;
      const allOrders = [
        ...Array.isArray(parsed.onlineOrders) ? parsed.onlineOrders : [],
        ...Array.isArray(parsed.offlineSales) ? parsed.offlineSales : []
      ];
      for (const o of allOrders) {
        if (o && typeof o.id === "string") {
          const match = o.id.match(/^MP-(\d+)$/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxExisting) maxExisting = num;
          }
        }
      }
      parsed.nextOrderNumber = Math.max(1, maxExisting + 1);
    }
    try {
      fs2.copyFileSync(DATA_FILE, BACKUP_FILE);
    } catch (_) {
    }
    return parsed;
  }
  const initial = createInitialStore();
  try {
    fs2.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), "utf-8");
    try {
      fs2.copyFileSync(DATA_FILE, BACKUP_FILE);
    } catch (_) {
    }
  } catch (writeErr) {
    console.warn("Could not write initial store to disk (ephemeral memory in use):", writeErr);
  }
  return initial;
})();
function saveStore() {
  try {
    const dataStr = JSON.stringify(store, null, 2);
    const tmpFile = path2.join(DATA_DIR, `momentpress-store.json.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 7)}`);
    fs2.writeFileSync(tmpFile, dataStr, "utf-8");
    try {
      fs2.renameSync(tmpFile, DATA_FILE);
    } catch (renameErr) {
      fs2.copyFileSync(tmpFile, DATA_FILE);
      try {
        fs2.unlinkSync(tmpFile);
      } catch (_) {
      }
    }
    try {
      fs2.copyFileSync(DATA_FILE, BACKUP_FILE);
    } catch (_) {
    }
  } catch (err) {
    console.warn("Failed saving store to disk (continuing with in-memory store):", err);
  }
}
function getBillsDir() {
  const dir = path2.join(DATA_DIR, "bills");
  try {
    if (!fs2.existsSync(dir)) {
      fs2.mkdirSync(dir, { recursive: true });
    }
    return dir;
  } catch (err) {
    const fallback = path2.join(os2.tmpdir(), "momentpress-bills");
    try {
      if (!fs2.existsSync(fallback)) {
        fs2.mkdirSync(fallback, { recursive: true });
      }
    } catch (_) {
    }
    return fallback;
  }
}
function requireAdminAuth(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (typeof req.query.token === "string" && req.query.token.trim()) {
    token = req.query.token.trim();
  } else if (typeof req.query.auth === "string" && req.query.auth.trim()) {
    token = req.query.auth.trim();
  }
  if (!token) {
    res.status(401).json({ error: "Unauthorized: Admin authentication token required" });
    return;
  }
  const now = Date.now();
  const session = store.sessions.find((s) => s.token === token && s.expiresAt > now);
  if (!session) {
    res.status(401).json({ error: "Unauthorized: Session expired or invalid" });
    return;
  }
  req.adminSession = session;
  next();
}
app.get("/api/auth/status", (req, res) => {
  res.json({
    isSetupRequired: Boolean(store.adminCredentials.needsSetup)
  });
});
app.post("/api/auth/setup", (req, res) => {
  if (!store.adminCredentials.needsSetup) {
    res.status(403).json({ error: "Administrator credentials already established. Setup is locked." });
    return;
  }
  const { username, password } = req.body;
  if (!username || typeof username !== "string" || !username.trim()) {
    res.status(400).json({ error: "Valid administrator username or email is required" });
    return;
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters long" });
    return;
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    res.status(400).json({ error: "Password must contain both letters and numbers" });
    return;
  }
  const salt = generateSalt();
  store.adminCredentials = {
    username: username.trim(),
    passwordSalt: salt,
    passwordHash: hashPassword(password, salt),
    needsSetup: false,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const token = generateSecureToken();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1e3;
  store.sessions = [
    {
      token,
      username: store.adminCredentials.username,
      createdAt: Date.now(),
      expiresAt
    }
  ];
  saveStore();
  res.json({
    success: true,
    message: "Production administrator credentials established successfully.",
    token,
    username: store.adminCredentials.username,
    expiresAt
  });
});
app.post("/api/auth/login", (req, res) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const attempt = loginAttemptsMap.get(ip) || { failedAttempts: 0, blockedUntil: 0 };
  if (attempt.blockedUntil > now) {
    const remainingMinutes = Math.ceil((attempt.blockedUntil - now) / 6e4);
    res.status(429).json({
      error: `Too many failed login attempts. Account temporarily locked for security. Please try again in ${remainingMinutes} minute(s).`
    });
    return;
  }
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }
  const normalizedInputUser = String(username).trim().toLowerCase();
  const storedUser = store.adminCredentials.username.trim().toLowerCase();
  const userMatches = normalizedInputUser === storedUser || storedUser === "admin" && normalizedInputUser === "admin@momentpress.in" || storedUser === "admin@momentpress.in" && normalizedInputUser === "admin";
  const inputHash = store.adminCredentials.passwordSalt ? hashPassword(String(password), store.adminCredentials.passwordSalt) : "";
  const passwordMatches = inputHash === store.adminCredentials.passwordHash;
  if (!userMatches || !passwordMatches) {
    attempt.failedAttempts += 1;
    if (attempt.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      attempt.blockedUntil = now + BLOCK_DURATION_MS;
      attempt.failedAttempts = 0;
    }
    loginAttemptsMap.set(ip, attempt);
    res.status(401).json({ error: "Invalid credentials. Access denied." });
    return;
  }
  loginAttemptsMap.delete(ip);
  store.sessions = (store.sessions || []).filter((s) => s.expiresAt > now);
  const token = generateSecureToken();
  const expiresAt = now + 24 * 60 * 60 * 1e3;
  store.sessions.push({
    token,
    username: store.adminCredentials.username,
    createdAt: now,
    expiresAt
  });
  saveStore();
  res.json({
    success: true,
    token,
    username: store.adminCredentials.username,
    expiresAt
  });
});
app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ authenticated: false });
    return;
  }
  const token = authHeader.substring(7).trim();
  const now = Date.now();
  const session = store.sessions.find((s) => s.token === token && s.expiresAt > now);
  if (!session) {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({
    authenticated: true,
    username: session.username,
    expiresAt: session.expiresAt
  });
});
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    store.sessions = store.sessions.filter((s) => s.token !== token);
    saveStore();
  }
  res.json({ success: true, message: "Logged out successfully" });
});
app.post("/api/auth/change-credentials", requireAdminAuth, (req, res) => {
  const { currentPassword, newPassword, newUsername } = req.body;
  const currentToken = req.adminSession?.token;
  if (!currentPassword) {
    res.status(400).json({ error: "Current password is required" });
    return;
  }
  const currentHash = hashPassword(String(currentPassword), store.adminCredentials.passwordSalt);
  if (currentHash !== store.adminCredentials.passwordHash) {
    res.status(403).json({ error: "Current password is incorrect" });
    return;
  }
  if (newUsername && typeof newUsername === "string" && newUsername.trim()) {
    store.adminCredentials.username = newUsername.trim();
  }
  if (newPassword && typeof newPassword === "string") {
    if (newPassword.length < 8) {
      res.status(400).json({ error: "New password must be at least 8 characters long" });
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      res.status(400).json({ error: "New password must contain both letters and numbers" });
      return;
    }
    const newSalt = generateSalt();
    store.adminCredentials.passwordSalt = newSalt;
    store.adminCredentials.passwordHash = hashPassword(newPassword, newSalt);
    store.sessions = store.sessions.filter((s) => s.token === currentToken);
  }
  store.adminCredentials.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  saveStore();
  res.json({
    success: true,
    message: "Admin credentials successfully updated",
    username: store.adminCredentials.username
  });
});
app.get("/api/public/config", (req, res) => {
  const frameSizes = store.frameSizes.filter((f) => f.active).map((f) => {
    let finalPrice = f.originalPrice;
    if (f.discountActive) {
      if (typeof f.discountedPrice === "number" && f.discountedPrice > 0) {
        finalPrice = f.discountedPrice;
      } else if (typeof f.discountPercentage === "number" && f.discountPercentage > 0) {
        finalPrice = Math.round(f.originalPrice * (1 - f.discountPercentage / 100));
      }
    }
    return {
      ...f,
      sellingPrice: finalPrice,
      hasDiscount: f.discountActive && finalPrice < f.originalPrice
    };
  });
  const qualityTiers = store.qualityTiers.filter((q) => q.active).map((q) => {
    let finalDelta = q.originalPriceDelta;
    if (q.discountActive && typeof q.discountedPriceDelta === "number") {
      finalDelta = q.discountedPriceDelta;
    }
    return {
      ...q,
      priceAdjustment: finalDelta,
      hasDiscount: q.discountActive && finalDelta < q.originalPriceDelta
    };
  });
  const stickerSizes = store.stickerSizes.filter((s) => s.active).map((s) => {
    let finalPrice = s.originalPrice;
    if (s.discountActive) {
      if (typeof s.discountedPrice === "number" && s.discountedPrice > 0) {
        finalPrice = s.discountedPrice;
      } else if (typeof s.discountPercentage === "number" && s.discountPercentage > 0) {
        finalPrice = Math.round(s.originalPrice * (1 - s.discountPercentage / 100));
      }
    }
    return {
      ...s,
      sellingPrice: finalPrice,
      hasDiscount: s.discountActive && finalPrice < s.originalPrice
    };
  });
  const products = store.products.filter((p) => p.active).map((p) => {
    let finalStarting = p.originalStartingPrice;
    if (p.discountActive && typeof p.discountedStartingPrice === "number" && p.discountedStartingPrice > 0) {
      finalStarting = p.discountedStartingPrice;
    }
    return {
      ...p,
      startingPrice: finalStarting,
      hasDiscount: p.discountActive && finalStarting < p.originalStartingPrice
    };
  });
  res.json({
    products,
    frameSizes,
    qualityTiers,
    stickerSizes,
    existingDesigns: (store.existingDesigns || []).filter((d) => d.active !== false && d.visible !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
    reviews: (store.reviews || []).filter((r) => r.active !== false && r.visible !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((r) => ({
      id: r.id,
      customerName: r.customerName || r.name || "",
      name: r.customerName || r.name || "",
      reviewText: r.reviewText || r.comment || "",
      comment: r.reviewText || r.comment || "",
      rating: r.rating,
      date: r.date || "",
      location: r.location || "",
      imageUrl: r.imageUrl || r.customerPhoto || "",
      customerPhoto: r.customerPhoto || r.imageUrl || "",
      featured: Boolean(r.featured),
      displayOrder: r.displayOrder || 0,
      verified: r.verified !== false,
      productPurchased: r.productPurchased || ""
    })),
    faqs: (store.faqs || []).filter((f) => f.active !== false && f.visible !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
    offers: (store.offers || []).filter((o) => o.active !== false && o.visible !== false),
    homepageHero: store.homepageHero,
    homepageSections: store.homepageSections,
    settings: {
      ...store.websiteSettings,
      whatsapp: store.websiteSettings.whatsappNumber
    },
    whatsappTemplates: store.whatsappTemplates
  });
});
function calculateServerOrderPrice(params) {
  if (params.quantity === void 0 || params.quantity === null || typeof params.quantity === "boolean") {
    return {
      valid: false,
      status: 400,
      error: "Quantity is required",
      productName: "",
      sizeName: "",
      qualityName: "",
      quantity: 0,
      unitOriginalPrice: 0,
      unitPrice: 0,
      unitDiscount: 0,
      totalOriginalPrice: 0,
      totalDiscount: 0,
      finalAmount: 0
    };
  }
  const numQty = Number(params.quantity);
  if (isNaN(numQty) || !Number.isInteger(numQty) || numQty < 1 || numQty > 100) {
    return {
      valid: false,
      status: 400,
      error: "Quantity must be a whole number between 1 and 100",
      productName: "",
      sizeName: "",
      qualityName: "",
      quantity: 0,
      unitOriginalPrice: 0,
      unitPrice: 0,
      unitDiscount: 0,
      totalOriginalPrice: 0,
      totalDiscount: 0,
      finalAmount: 0
    };
  }
  const qty = numQty;
  const rawProduct = String(params.product || "").trim();
  const lowerProduct = rawProduct.toLowerCase();
  const isFrame = lowerProduct.includes("frame") || lowerProduct === "custom-photo-frames";
  const isSticker = lowerProduct.includes("sticker") || lowerProduct === "photo-stickers";
  if (!isFrame && !isSticker) {
    return {
      valid: false,
      status: 400,
      error: `Invalid product: "${rawProduct}". Must be "Custom Photo Frames" or "Photo Stickers".`,
      productName: "",
      sizeName: "",
      qualityName: "",
      quantity: qty,
      unitOriginalPrice: 0,
      unitPrice: 0,
      unitDiscount: 0,
      totalOriginalPrice: 0,
      totalDiscount: 0,
      finalAmount: 0
    };
  }
  if (isFrame) {
    const rawSize = String(params.size || "").trim();
    if (!rawSize) {
      return {
        valid: false,
        status: 400,
        error: "Frame size is required",
        productName: "Custom Photo Frames",
        sizeName: "",
        qualityName: "",
        quantity: qty,
        unitOriginalPrice: 0,
        unitPrice: 0,
        unitDiscount: 0,
        totalOriginalPrice: 0,
        totalDiscount: 0,
        finalAmount: 0
      };
    }
    const normalize = (s) => s.toLowerCase().replace(/[\s×x\-in\.]/g, "");
    const normSize = normalize(rawSize);
    const frameSize = store.frameSizes.find(
      (f) => f.active !== false && (f.id.toLowerCase() === rawSize.toLowerCase() || f.name.toLowerCase() === rawSize.toLowerCase() || normalize(f.id) === normSize || normalize(f.name) === normSize)
    );
    if (!frameSize) {
      const available = store.frameSizes.filter((f) => f.active !== false).map((f) => f.name).join(", ");
      return {
        valid: false,
        status: 400,
        error: `Invalid frame size: "${rawSize}". Available sizes: ${available}`,
        productName: "Custom Photo Frames",
        sizeName: "",
        qualityName: "",
        quantity: qty,
        unitOriginalPrice: 0,
        unitPrice: 0,
        unitDiscount: 0,
        totalOriginalPrice: 0,
        totalDiscount: 0,
        finalAmount: 0
      };
    }
    const rawQuality = String(params.quality || "").trim();
    if (!rawQuality) {
      return {
        valid: false,
        status: 400,
        error: "Frame quality tier is required",
        productName: "Custom Photo Frames",
        sizeName: frameSize.name,
        qualityName: "",
        quantity: qty,
        unitOriginalPrice: 0,
        unitPrice: 0,
        unitDiscount: 0,
        totalOriginalPrice: 0,
        totalDiscount: 0,
        finalAmount: 0
      };
    }
    const lowerQuality = rawQuality.toLowerCase();
    const qualityTier = store.qualityTiers.find(
      (q) => q.active !== false && (q.id.toLowerCase() === lowerQuality || q.name.toLowerCase() === lowerQuality || lowerQuality.includes("standard") && (q.id === "good" || q.name.toLowerCase().includes("luster")) || lowerQuality.includes("luster") && q.id === "good" || lowerQuality.includes("velvet") && q.id === "better" || lowerQuality.includes("archival") && q.id === "best" || lowerQuality.includes("fine art") && q.id === "best")
    );
    if (!qualityTier) {
      const available = store.qualityTiers.filter((q) => q.active !== false).map((q) => q.name).join(", ");
      return {
        valid: false,
        status: 400,
        error: `Invalid quality tier: "${rawQuality}". Available tiers: ${available}`,
        productName: "Custom Photo Frames",
        sizeName: frameSize.name,
        qualityName: "",
        quantity: qty,
        unitOriginalPrice: 0,
        unitPrice: 0,
        unitDiscount: 0,
        totalOriginalPrice: 0,
        totalDiscount: 0,
        finalAmount: 0
      };
    }
    const origSizePrice = Math.max(0, Number(frameSize.originalPrice ?? frameSize.basePrice) || 0);
    let sizeSellingPrice = origSizePrice;
    if (frameSize.discountActive) {
      if (typeof frameSize.discountedPrice === "number" && frameSize.discountedPrice > 0 && frameSize.discountedPrice <= origSizePrice) {
        sizeSellingPrice = frameSize.discountedPrice;
      } else if (typeof frameSize.discountPercentage === "number" && frameSize.discountPercentage > 0 && frameSize.discountPercentage <= 100) {
        sizeSellingPrice = Math.round(origSizePrice * (1 - frameSize.discountPercentage / 100));
      }
    }
    const origTierDelta = Math.max(0, Number(qualityTier.originalPriceDelta ?? qualityTier.priceAdjustment) || 0);
    let tierDelta = origTierDelta;
    if (qualityTier.discountActive && typeof qualityTier.discountedPriceDelta === "number" && qualityTier.discountedPriceDelta >= 0) {
      tierDelta = qualityTier.discountedPriceDelta;
    }
    const unitOriginalPrice = origSizePrice + origTierDelta;
    const unitPrice = sizeSellingPrice + tierDelta;
    const unitDiscount = Math.max(0, unitOriginalPrice - unitPrice);
    const totalOriginalPrice = unitOriginalPrice * qty;
    const finalAmount = Math.max(0, unitPrice * qty);
    const totalDiscount = Math.max(0, totalOriginalPrice - finalAmount);
    return {
      valid: true,
      status: 200,
      productName: "Custom Photo Frames",
      sizeName: frameSize.name,
      qualityName: qualityTier.name,
      quantity: qty,
      unitOriginalPrice,
      unitPrice,
      unitDiscount,
      totalOriginalPrice,
      totalDiscount,
      finalAmount
    };
  } else {
    const rawSize = String(params.size || "").trim();
    if (!rawSize) {
      return {
        valid: false,
        status: 400,
        error: "Sticker size is required",
        productName: "Photo Stickers",
        sizeName: "",
        qualityName: "Matte Vinyl",
        quantity: qty,
        unitOriginalPrice: 0,
        unitPrice: 0,
        unitDiscount: 0,
        totalOriginalPrice: 0,
        totalDiscount: 0,
        finalAmount: 0
      };
    }
    const lowerSize = rawSize.toLowerCase();
    const stickerSize = store.stickerSizes.find(
      (s) => s.active !== false && (s.id.toLowerCase() === lowerSize || s.name.toLowerCase() === lowerSize || s.name.toLowerCase().startsWith(lowerSize) || lowerSize.startsWith(s.id.toLowerCase()))
    );
    if (!stickerSize) {
      const available = store.stickerSizes.filter((s) => s.active !== false).map((s) => s.name).join(", ");
      return {
        valid: false,
        status: 400,
        error: `Invalid sticker size: "${rawSize}". Available sizes: ${available}`,
        productName: "Photo Stickers",
        sizeName: "",
        qualityName: "Matte Vinyl",
        quantity: qty,
        unitOriginalPrice: 0,
        unitPrice: 0,
        unitDiscount: 0,
        totalOriginalPrice: 0,
        totalDiscount: 0,
        finalAmount: 0
      };
    }
    const origPrice = Math.max(0, Number(stickerSize.originalPrice ?? stickerSize.price) || 0);
    let stickerSellingPrice = origPrice;
    if (stickerSize.discountActive) {
      if (typeof stickerSize.discountedPrice === "number" && stickerSize.discountedPrice > 0 && stickerSize.discountedPrice <= origPrice) {
        stickerSellingPrice = stickerSize.discountedPrice;
      } else if (typeof stickerSize.discountPercentage === "number" && stickerSize.discountPercentage > 0 && stickerSize.discountPercentage <= 100) {
        stickerSellingPrice = Math.round(origPrice * (1 - stickerSize.discountPercentage / 100));
      }
    }
    const unitOriginalPrice = origPrice;
    const unitPrice = stickerSellingPrice;
    const unitDiscount = Math.max(0, unitOriginalPrice - unitPrice);
    const totalOriginalPrice = unitOriginalPrice * qty;
    const finalAmount = Math.max(0, unitPrice * qty);
    const totalDiscount = Math.max(0, totalOriginalPrice - finalAmount);
    return {
      valid: true,
      status: 200,
      productName: "Photo Stickers",
      sizeName: stickerSize.name,
      qualityName: "Matte Vinyl",
      quantity: qty,
      unitOriginalPrice,
      unitPrice,
      unitDiscount,
      totalOriginalPrice,
      totalDiscount,
      finalAmount
    };
  }
}
function getNextSequentialOrderNumber() {
  let maxExisting = 0;
  const allOrders = [
    ...Array.isArray(store.onlineOrders) ? store.onlineOrders : [],
    ...Array.isArray(store.offlineSales) ? store.offlineSales : []
  ];
  for (const o of allOrders) {
    if (o && typeof o.id === "string") {
      const match = o.id.match(/^MP-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxExisting) {
          maxExisting = num;
        }
      }
    }
  }
  const currentNext = typeof store.nextOrderNumber === "number" && store.nextOrderNumber > 0 ? store.nextOrderNumber : 1;
  const assignedNumber = Math.max(currentNext, maxExisting + 1);
  store.nextOrderNumber = assignedNumber + 1;
  saveStore();
  return assignedNumber;
}
function generateServerOrderId() {
  const num = getNextSequentialOrderNumber();
  return `MP-${num}`;
}
app.post("/api/public/orders", (req, res) => {
  const ip = getClientIp(req);
  const now = Date.now();
  let rateRecord = orderRateLimitMap.get(ip);
  if (!rateRecord || rateRecord.resetAt < now) {
    rateRecord = { count: 0, resetAt: now + ORDER_WINDOW_MS };
  }
  if (rateRecord.count >= MAX_ORDERS_PER_WINDOW) {
    res.status(429).json({ error: "Too many order requests. Please wait a few moments before trying again." });
    return;
  }
  rateRecord.count++;
  orderRateLimitMap.set(ip, rateRecord);
  const {
    customerName,
    mobileNumber,
    address,
    city,
    pincode,
    product,
    size,
    quality,
    quantity,
    requirements,
    idempotencyKey,
    orderId: clientOrderId
  } = req.body;
  if (!customerName || typeof customerName !== "string" || customerName.trim().length < 2) {
    res.status(400).json({ error: "Valid customer name is required (minimum 2 characters)" });
    return;
  }
  const cleanCustomerName = customerName.trim().slice(0, 100);
  if (!mobileNumber || typeof mobileNumber !== "string" && typeof mobileNumber !== "number") {
    res.status(400).json({ error: "Valid mobile number is required" });
    return;
  }
  const phoneDigits = String(mobileNumber).replace(/\D/g, "");
  let cleanMobile = phoneDigits;
  if (cleanMobile.length === 12 && cleanMobile.startsWith("91")) {
    cleanMobile = cleanMobile.slice(2);
  } else if (cleanMobile.length === 11 && cleanMobile.startsWith("0")) {
    cleanMobile = cleanMobile.slice(1);
  }
  if (cleanMobile.length !== 10) {
    res.status(400).json({ error: "Enter a valid 10-digit mobile number" });
    return;
  }
  if (!address || typeof address !== "string" || address.trim().length < 5) {
    res.status(400).json({ error: "Complete delivery address is required (minimum 5 characters)" });
    return;
  }
  const cleanAddress = address.trim().slice(0, 300);
  const cleanCity = typeof city === "string" && city.trim().length > 0 ? city.trim().slice(0, 60) : "Kolkata";
  if (!pincode || typeof pincode !== "string" && typeof pincode !== "number") {
    res.status(400).json({ error: "Valid 6-digit pincode is required" });
    return;
  }
  const cleanPincode = String(pincode).replace(/\D/g, "");
  if (cleanPincode.length !== 6) {
    res.status(400).json({ error: "Pincode must be exactly 6 digits" });
    return;
  }
  const cleanRequirements = typeof requirements === "string" ? requirements.trim().slice(0, 500) : "";
  const pricingResult = calculateServerOrderPrice({
    product,
    size,
    quality,
    quantity
  });
  if (!pricingResult.valid) {
    res.status(pricingResult.status).json({ error: pricingResult.error });
    return;
  }
  const activeIdempotencyKey = typeof idempotencyKey === "string" && idempotencyKey.trim().length > 0 ? idempotencyKey.trim().slice(0, 100) : typeof clientOrderId === "string" && clientOrderId.trim().length > 0 ? clientOrderId.trim().slice(0, 100) : null;
  if (activeIdempotencyKey) {
    const existingOrder = store.onlineOrders.find(
      (o) => o.idempotencyKey === activeIdempotencyKey || activeIdempotencyKey.startsWith("MP-") && o.id === activeIdempotencyKey
    );
    if (existingOrder) {
      res.status(200).json({
        success: true,
        duplicate: true,
        order: {
          id: existingOrder.id,
          customerName: existingOrder.customerName,
          mobileNumber: existingOrder.mobileNumber,
          address: existingOrder.address,
          city: existingOrder.city,
          pincode: existingOrder.pincode,
          product: existingOrder.product,
          size: existingOrder.size,
          quality: existingOrder.quality,
          quantity: existingOrder.quantity,
          unitPrice: existingOrder.unitPrice,
          discount: existingOrder.discount,
          finalAmount: existingOrder.finalAmount,
          requirements: existingOrder.requirements,
          orderStatus: existingOrder.orderStatus,
          paymentStatus: existingOrder.paymentStatus,
          createdDate: existingOrder.createdDate
        }
      });
      return;
    }
  }
  const newOrderId = generateServerOrderId();
  const createdDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const newOrder = {
    id: newOrderId,
    customerName: cleanCustomerName,
    mobileNumber: cleanMobile,
    address: cleanAddress,
    city: cleanCity,
    pincode: cleanPincode,
    product: pricingResult.productName,
    size: pricingResult.sizeName,
    quality: pricingResult.qualityName,
    quantity: pricingResult.quantity,
    unitPrice: pricingResult.unitPrice,
    discount: pricingResult.totalDiscount,
    finalAmount: pricingResult.finalAmount,
    paymentMethod: "UPI",
    paymentStatus: "Pending",
    requirements: cleanRequirements,
    photoStatus: "Pending Upload",
    orderStatus: "Pending",
    productCost: 0,
    printingCost: 0,
    packagingCost: 0,
    deliveryCost: 0,
    otherCost: 0,
    totalCost: 0,
    profit: pricingResult.finalAmount,
    profitMargin: 100,
    createdDate,
    expectedDeliveryDate: new Date(Date.now() + 48 * 3600 * 1e3).toISOString().split("T")[0],
    stockDeducted: false,
    idempotencyKey: activeIdempotencyKey || void 0
  };
  store.onlineOrders.unshift(newOrder);
  let customer = store.customers.find((c) => c.mobile === cleanMobile);
  if (!customer) {
    customer = {
      id: `CUST-${Math.floor(1e3 + Math.random() * 9e3)}`,
      name: cleanCustomerName,
      mobile: cleanMobile,
      address: newOrder.address,
      city: newOrder.city,
      pincode: newOrder.pincode,
      totalOrders: 1,
      totalSpending: pricingResult.finalAmount,
      lastOrderDate: newOrder.createdDate
    };
    store.customers.push(customer);
  } else {
    customer.totalOrders += 1;
    customer.totalSpending += pricingResult.finalAmount;
    customer.lastOrderDate = newOrder.createdDate;
  }
  saveStore();
  void appendOrderToSheet(newOrder, store.frameSizes).catch((syncErr) => {
    console.warn(`[Google Sheets] Async sync error for ${newOrder.id}:`, syncErr?.message || syncErr);
  });
  res.status(201).json({
    success: true,
    order: {
      id: newOrder.id,
      customerName: newOrder.customerName,
      mobileNumber: newOrder.mobileNumber,
      address: newOrder.address,
      city: newOrder.city,
      pincode: newOrder.pincode,
      product: newOrder.product,
      size: newOrder.size,
      quality: newOrder.quality,
      quantity: newOrder.quantity,
      unitPrice: newOrder.unitPrice,
      discount: newOrder.discount,
      finalAmount: newOrder.finalAmount,
      requirements: newOrder.requirements,
      orderStatus: newOrder.orderStatus,
      paymentStatus: newOrder.paymentStatus,
      createdDate: newOrder.createdDate
    }
  });
});
function buildPublicBillData(order) {
  const numericSuffix = (order.id || "").replace(/^MP-/i, "");
  const billNumber = order.billNumber || `MP-BILL-${numericSuffix || Date.now()}`;
  const billGeneratedAt = order.billGeneratedAt || (/* @__PURE__ */ new Date()).toISOString();
  return {
    orderId: order.id,
    billNumber,
    billGeneratedAt,
    createdDate: order.createdDate || order.orderDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    orderStatus: order.orderStatus || "Pending",
    paymentStatus: order.paymentStatus || "Pending",
    paymentMethod: order.paymentMethod || "UPI",
    billPdfUrl: order.billToken ? `/api/public/bills/${order.billToken}/pdf` : void 0,
    billDriveUrl: order.billDriveUrl,
    billDriveDownloadUrl: order.billDriveDownloadUrl,
    billDriveStatus: order.billDriveStatus,
    customer: {
      name: order.customerName || order.customer?.name || "Valued Customer",
      mobileNumber: order.mobileNumber || order.customer?.phone || order.phone || "",
      address: order.address || order.customer?.address || "",
      city: order.city || order.customer?.city || "Kolkata",
      pincode: order.pincode || order.customer?.pincode || ""
    },
    item: {
      product: order.product || "Custom Photo Frames",
      size: order.size || "",
      finish: order.finish || (order.product?.toLowerCase().includes("sticker") ? "N/A" : "Standard"),
      quality: order.quality || "",
      quantity: Number(order.quantity) || 1,
      unitPrice: Number(order.unitPrice ?? order.sellingPrice ?? order.finalAmount) || 0,
      discount: Number(order.discount) || 0,
      finalAmount: Number(order.finalAmount ?? order.totalPrice) || 0,
      requirements: order.requirements || ""
    },
    studio: {
      name: store.websiteSettings?.studioName || "MomentPress",
      tagline: store.websiteSettings?.tagline || "Your Photos. Your Story. Your Frame.",
      phone: store.websiteSettings?.phone || "6291681660",
      whatsappNumber: store.websiteSettings?.whatsappNumber || "7980855821",
      email: store.websiteSettings?.email || "connect.rrstudio@gmail.com",
      instagramHandle: store.websiteSettings?.instagramHandle || "@_rr.studio__",
      instagramUrl: store.websiteSettings?.instagramUrl || "https://www.instagram.com/_rr.studio__/",
      address: store.websiteSettings?.address || "Bowbazar, Central Kolkata, West Bengal 700012",
      city: store.websiteSettings?.city || "Kolkata"
    }
  };
}
app.get("/api/public/bills/:token", (req, res) => {
  const token = req.params.token;
  if (!token || typeof token !== "string" || token.trim().length < 16 || token.trim().length > 128) {
    res.status(404).json({ error: "Bill not found" });
    return;
  }
  const ip = getClientIp(req);
  const now = Date.now();
  let rateRecord = billRateLimitMap.get(ip);
  if (!rateRecord || rateRecord.resetAt < now) {
    rateRecord = { count: 0, resetAt: now + BILL_WINDOW_MS };
  }
  if (rateRecord.count >= MAX_BILLS_PER_WINDOW) {
    res.status(429).json({ error: "Too many requests. Please wait a few moments." });
    return;
  }
  rateRecord.count++;
  billRateLimitMap.set(ip, rateRecord);
  const cleanToken = token.trim();
  let order = store.onlineOrders.find((o) => o.billToken === cleanToken);
  if (!order) {
    order = store.offlineSales.find((s) => s.billToken === cleanToken);
  }
  if (!order) {
    res.status(404).json({ error: "Bill not found" });
    return;
  }
  res.json({
    success: true,
    bill: buildPublicBillData(order)
  });
});
app.get("/api/public/bills/:token/pdf", async (req, res) => {
  const token = req.params.token;
  if (!token || typeof token !== "string" || token.trim().length < 16 || token.trim().length > 128) {
    res.status(404).json({ error: "Bill not found" });
    return;
  }
  const ip = getClientIp(req);
  const now = Date.now();
  let rateRecord = billRateLimitMap.get(ip);
  if (!rateRecord || rateRecord.resetAt < now) {
    rateRecord = { count: 0, resetAt: now + BILL_WINDOW_MS };
  }
  if (rateRecord.count >= MAX_BILLS_PER_WINDOW) {
    res.status(429).json({ error: "Too many requests. Please wait a few moments." });
    return;
  }
  rateRecord.count++;
  billRateLimitMap.set(ip, rateRecord);
  const cleanToken = token.trim();
  let order = store.onlineOrders.find((o) => o.billToken === cleanToken);
  if (!order) {
    order = store.offlineSales.find((s) => s.billToken === cleanToken);
  }
  if (!order) {
    res.status(404).json({ error: "Bill not found" });
    return;
  }
  try {
    const billData = buildPublicBillData(order);
    const billsDir = getBillsDir();
    let pdfBuffer;
    if (order.billPdfPath && fs2.existsSync(order.billPdfPath)) {
      pdfBuffer = await fs2.promises.readFile(order.billPdfPath);
    } else {
      const generated = await generateAndSaveBillPdf(billData, billsDir);
      order.billPdfPath = generated.filePath;
      order.billFileName = generated.fileName;
      saveStore();
      pdfBuffer = generated.buffer;
    }
    const numericSuffix = (order.id || "").replace(/^MP-/i, "");
    const fileName = `MomentPress-Bill-MP-${numericSuffix || order.id}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", String(pdfBuffer.length));
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error streaming public bill PDF:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});
app.get("/api/admin/all-data", requireAdminAuth, (req, res) => {
  res.json({
    onlineOrders: store.onlineOrders,
    offlineSales: store.offlineSales,
    customers: store.customers,
    inventory: store.inventory,
    stockMovements: store.stockMovements,
    purchases: store.purchases,
    expenses: store.expenses,
    activityLog: store.activityLog,
    reviews: store.reviews,
    products: store.products,
    frameSizes: store.frameSizes,
    qualityTiers: store.qualityTiers,
    stickerSizes: store.stickerSizes,
    existingDesigns: store.existingDesigns,
    faqs: store.faqs,
    offers: store.offers,
    websiteSettings: store.websiteSettings,
    whatsappTemplates: store.whatsappTemplates,
    homepageHero: store.homepageHero,
    homepageSections: store.homepageSections,
    productMappings: store.productMappings
  });
});
app.get("/api/admin/orders", requireAdminAuth, (req, res) => {
  res.json({ success: true, orders: store.onlineOrders });
});
app.patch("/api/admin/orders/:id", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = store.onlineOrders.findIndex((o) => o.id === id);
  if (idx === -1) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  store.onlineOrders[idx] = { ...store.onlineOrders[idx], ...updates };
  saveStore();
  void updateOrderInSheet(id, updates).catch((syncErr) => {
    console.warn(`[Google Sheets] Async update error for ${id}:`, syncErr?.message || syncErr);
  });
  res.json({ success: true, order: store.onlineOrders[idx] });
});
app.get("/api/admin/orders/:id/pdf", requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  let order = store.onlineOrders.find((o) => o.id === id);
  if (!order) {
    order = store.offlineSales.find((s) => s.id === id);
  }
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  try {
    const billsDir = getBillsDir();
    let pdfBuffer;
    if (!order.billPdfPath || !fs2.existsSync(order.billPdfPath)) {
      const numericSuffix2 = (order.id || "").replace(/^MP-/i, "");
      order.billNumber = order.billNumber || `MP-BILL-${numericSuffix2 || Date.now()}`;
      order.billToken = order.billToken || crypto.randomBytes(24).toString("hex");
      order.billGeneratedAt = order.billGeneratedAt || (/* @__PURE__ */ new Date()).toISOString();
      order.billGenerated = true;
      const billData = buildPublicBillData(order);
      const generated = await generateAndSaveBillPdf(billData, billsDir);
      order.billPdfPath = generated.filePath;
      order.billFileName = generated.fileName;
      saveStore();
      pdfBuffer = generated.buffer;
    } else {
      pdfBuffer = await fs2.promises.readFile(order.billPdfPath);
    }
    const isDownload = req.query.download === "true";
    const disposition = isDownload ? "attachment" : "inline";
    const numericSuffix = (order.id || "").replace(/^MP-/i, "");
    const fileName = `MomentPress-Bill-MP-${numericSuffix || order.id}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `${disposition}; filename="${fileName}"`);
    res.setHeader("Content-Length", String(pdfBuffer.length));
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating or streaming PDF:", err);
    res.status(500).json({ error: "Failed to stream PDF" });
  }
});
app.post("/api/admin/orders/:id/bill", requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  const isRegenerate = Boolean(req.body && req.body.regenerate);
  let order = store.onlineOrders.find((o) => o.id === id);
  if (!order) {
    order = store.offlineSales.find((s) => s.id === id);
  }
  if (!order) {
    res.status(404).json({ success: false, error: "Order not found", code: "BILL_ORDER_NOT_FOUND" });
    return;
  }
  if (!isRegenerate && order.billGenerated && order.billNumber && (order.billDriveStatus === "VERIFIED" || order.billPdfPath && fs2.existsSync(order.billPdfPath))) {
    res.json({
      success: true,
      alreadyGenerated: true,
      order,
      driveResult: {
        status: order.billDriveStatus || "VERIFIED",
        message: order.billDriveMessage || "Bill already generated and verified.",
        fileId: order.billDriveFileId,
        webViewLink: order.billDriveUrl,
        webContentLink: order.billDriveDownloadUrl,
        uploadedAt: order.billUploadedAt,
        reused: true
      }
    });
    return;
  }
  try {
    const numericSuffix = (order.id || "").replace(/^MP-/i, "");
    const billNumber = order.billNumber || `MP-BILL-${numericSuffix || Date.now()}`;
    const billToken = order.billToken || crypto.randomBytes(24).toString("hex");
    const billGeneratedAt = order.billGeneratedAt || (/* @__PURE__ */ new Date()).toISOString();
    order.billNumber = billNumber;
    order.billToken = billToken;
    order.billGeneratedAt = billGeneratedAt;
    order.billGenerated = true;
    let generated;
    try {
      const billsDir = getBillsDir();
      const billData = buildPublicBillData(order);
      generated = await generateAndSaveBillPdf(billData, billsDir);
      order.billPdfPath = generated.filePath;
      order.billFileName = generated.fileName;
    } catch (pdfErr) {
      console.error("[Billing] PDF Generation failed:", pdfErr);
      res.status(500).json({
        success: false,
        error: `Failed to generate PDF: ${pdfErr?.message || pdfErr}`,
        code: "BILL_PDF_GENERATION_FAILED"
      });
      return;
    }
    const driveResult = await uploadBillToGoogleDrive({
      orderId: order.id,
      pdfBuffer: generated.buffer,
      fileName: generated.fileName,
      existingFileId: order.billDriveFileId,
      existingDriveUrl: order.billDriveUrl,
      existingDownloadUrl: order.billDriveDownloadUrl,
      existingUploadedAt: order.billUploadedAt,
      forceReupload: isRegenerate
    });
    order.billDriveStatus = driveResult.status;
    order.billDriveMessage = driveResult.message;
    if (driveResult.status === "VERIFIED") {
      order.billDriveFileId = driveResult.fileId;
      order.billDriveUrl = driveResult.webViewLink;
      order.billDriveDownloadUrl = driveResult.webContentLink;
      order.billUploadedAt = driveResult.uploadedAt;
    }
    saveStore();
    if (driveResult.status !== "VERIFIED") {
      res.status(400).json({
        success: false,
        error: driveResult.message || "Google Drive bill upload failed",
        code: driveResult.status === "BLOCKED_CONFIG_REQUIRED" ? "BILL_DRIVE_AUTH_FAILED" : "BILL_DRIVE_UPLOAD_FAILED",
        order,
        driveResult
      });
      return;
    }
    void updateOrderInSheet(order.id, {
      "Bill Number": order.billNumber,
      "Bill Drive Link": order.billDriveUrl || "",
      "Bill Generated At": order.billGeneratedAt || ""
    }).catch((syncErr) => {
      console.warn(`[Google Sheets] Async bill update error for ${order.id}:`, syncErr?.message || syncErr);
    });
    res.json({
      success: true,
      regenerated: isRegenerate,
      order,
      driveResult
    });
  } catch (err) {
    console.error("Error generating bill:", err);
    res.status(500).json({
      success: false,
      error: `Failed to generate bill: ${err?.message || err}`,
      code: "BILL_PERSIST_FAILED"
    });
  }
});
function findOrderMapping(order) {
  const prodName = String(order.product || "").toLowerCase();
  const isFrame = prodName.includes("frame");
  const isSticker = prodName.includes("sticker");
  const mappings = Array.isArray(store.productMappings) ? store.productMappings : [];
  return mappings.find((m) => {
    if (isFrame && m.productType === "custom-photo-frames") {
      if (order.size && m.sizeName) {
        return m.sizeName.toLowerCase().replace(/\s+/g, "") === order.size.toLowerCase().replace(/\s+/g, "");
      }
      return true;
    }
    if (isSticker && m.productType === "photo-stickers") {
      if (order.size && m.sizeName) {
        return m.sizeName.toLowerCase().includes(order.size.toLowerCase().trim());
      }
      return true;
    }
    return false;
  });
}
function checkStockForOrder(order) {
  const qty = Math.max(1, Number(order.quantity) || 1);
  const mapping = findOrderMapping(order);
  if (!mapping || !Array.isArray(mapping.consumes) || mapping.consumes.length === 0) {
    return { available: true, missingItems: [], requiredItems: [] };
  }
  const requiredItems = mapping.consumes.map((c) => {
    let itemId = c.inventoryItemId;
    if (order.quality) {
      const q = order.quality.toLowerCase();
      if (q.includes("velvet") || q.includes("better")) {
        if (itemId === "INV-PPR-LUSTER") itemId = "INV-PPR-VELVET";
      } else if (q.includes("archival") || q.includes("best") || q.includes("cotton")) {
        if (itemId === "INV-PPR-LUSTER") itemId = "INV-PPR-ARCHIVAL";
      }
    }
    const inv = store.inventory.find((i) => i.id === itemId);
    const requiredQty = Number(c.quantityPerUnit || 1) * qty;
    const availableQty = inv ? Number(inv.currentStock || 0) : 0;
    return {
      itemId,
      itemName: inv ? inv.name : itemId,
      requiredQty,
      availableQty,
      sufficient: availableQty >= requiredQty
    };
  });
  const missingItems = requiredItems.filter((r) => !r.sufficient);
  return {
    available: missingItems.length === 0,
    missingItems,
    requiredItems
  };
}
function executeStockDeduction(order) {
  const stockCheck = checkStockForOrder(order);
  if (!stockCheck.available) {
    const missingDesc = stockCheck.missingItems.map((m) => `${m.itemName} (Required: ${m.requiredQty}, Available: ${m.availableQty})`).join(", ");
    return { success: false, error: `Insufficient Stock: ${missingDesc}`, missingItems: stockCheck.missingItems };
  }
  const deductedItems = [];
  const now = (/* @__PURE__ */ new Date()).toISOString();
  for (const req of stockCheck.requiredItems) {
    const inv = store.inventory.find((i) => i.id === req.itemId);
    if (inv) {
      const prev = Number(inv.currentStock || 0);
      inv.currentStock = Math.max(0, prev - req.requiredQty);
      inv.lastUpdated = now.split("T")[0];
      store.stockMovements.unshift({
        id: `STK-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
        timestamp: now,
        itemId: inv.id,
        itemName: inv.name,
        type: order.isOffline ? "Deduction (Offline Sale)" : "Deduction (Online Order)",
        quantity: req.requiredQty,
        previousStock: prev,
        newStock: inv.currentStock,
        referenceId: order.id,
        notes: `Deducted for ${order.isOffline ? "offline sale" : "online order"} ${order.id} (${order.product} ${order.size || ""})`
      });
      deductedItems.push({
        itemId: inv.id,
        itemName: inv.name,
        quantity: req.requiredQty
      });
    }
  }
  return { success: true, deductedItems };
}
function executeStockRestoration(order) {
  if (!order.deductedItems || !Array.isArray(order.deductedItems) || order.deductedItems.length === 0) {
    return { success: true, restoredItems: [] };
  }
  const restoredItems = [];
  const now = (/* @__PURE__ */ new Date()).toISOString();
  for (const item of order.deductedItems) {
    const inv = store.inventory.find((i) => i.id === item.itemId);
    if (inv) {
      const prev = Number(inv.currentStock || 0);
      const qty = Number(item.quantity || 1);
      inv.currentStock = prev + qty;
      inv.lastUpdated = now.split("T")[0];
      store.stockMovements.unshift({
        id: `STK-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
        timestamp: now,
        itemId: inv.id,
        itemName: inv.name,
        type: "Restoration (Cancelled Order)",
        quantity: qty,
        previousStock: prev,
        newStock: inv.currentStock,
        referenceId: order.id,
        notes: `Restored stock from cancelled order ${order.id}`
      });
      restoredItems.push({
        itemId: inv.id,
        itemName: inv.name,
        quantity: qty
      });
    }
  }
  return { success: true, restoredItems };
}
app.get("/api/admin/mappings", requireAdminAuth, (req, res) => {
  res.json({ success: true, mappings: store.productMappings || [] });
});
app.post("/api/admin/mappings", requireAdminAuth, (req, res) => {
  const { mappings } = req.body;
  if (!Array.isArray(mappings)) {
    res.status(400).json({ error: "Mappings must be an array" });
    return;
  }
  store.productMappings = mappings;
  saveStore();
  res.json({ success: true, mappings: store.productMappings });
});
app.post("/api/admin/orders/online", requireAdminAuth, (req, res) => {
  const orderData = req.body;
  if (!orderData || !orderData.id) {
    res.status(400).json({ error: "Order ID is required" });
    return;
  }
  const idx = store.onlineOrders.findIndex((o) => o.id === orderData.id);
  if (idx >= 0) {
    store.onlineOrders[idx] = { ...store.onlineOrders[idx], ...orderData };
  } else {
    store.onlineOrders.unshift(orderData);
  }
  saveStore();
  if (idx >= 0) {
    void updateOrderInSheet(orderData.id, orderData).catch((syncErr) => {
      console.warn(`[Google Sheets] Async update error for ${orderData.id}:`, syncErr?.message || syncErr);
    });
  } else {
    void appendOrderToSheet(orderData, store.frameSizes).catch((syncErr) => {
      console.warn(`[Google Sheets] Async sync error for ${orderData.id}:`, syncErr?.message || syncErr);
    });
  }
  res.json({ success: true, order: idx >= 0 ? store.onlineOrders[idx] : orderData });
});
app.post("/api/admin/orders/offline", requireAdminAuth, (req, res) => {
  const saleData = req.body;
  if (!saleData || !saleData.id) {
    res.status(400).json({ error: "Sale ID is required" });
    return;
  }
  const selling = Number(saleData.sellingPrice) || Number(saleData.finalAmount) || 0;
  const prodCost = Number(saleData.productCost) || 0;
  const printCost = Number(saleData.printingCost) || 0;
  const packCost = Number(saleData.packagingCost) || 0;
  const delCost = Number(saleData.deliveryCost) || 0;
  const othCost = Number(saleData.otherCost) || 0;
  const totalCost = prodCost + printCost + packCost + delCost + othCost;
  const profit = selling - totalCost;
  const margin = selling > 0 ? parseFloat((profit / selling * 100).toFixed(1)) : 0;
  const idx = store.offlineSales.findIndex((s) => s.id === saleData.id);
  const existing = idx >= 0 ? store.offlineSales[idx] : null;
  const enrichedSale = {
    ...saleData,
    productCost: prodCost,
    printingCost: printCost,
    packagingCost: packCost,
    deliveryCost: delCost,
    otherCost: othCost,
    totalCost,
    profit,
    profitMargin: margin,
    stockDeducted: existing ? existing.stockDeducted : false,
    deductedItems: existing ? existing.deductedItems : void 0
  };
  if (enrichedSale.orderStatus === "Cancelled" && enrichedSale.stockDeducted) {
    executeStockRestoration(enrichedSale);
    enrichedSale.stockDeducted = false;
    enrichedSale.deductedItems = [];
  } else if (!enrichedSale.stockDeducted && enrichedSale.orderStatus !== "Cancelled") {
    const deductRes = executeStockDeduction({
      id: enrichedSale.id,
      product: enrichedSale.product,
      size: enrichedSale.size,
      quality: enrichedSale.quality,
      quantity: enrichedSale.quantity,
      isOffline: true
    });
    if (deductRes.success) {
      enrichedSale.stockDeducted = true;
      enrichedSale.stockDeductedAt = (/* @__PURE__ */ new Date()).toISOString();
      enrichedSale.deductedItems = deductRes.deductedItems;
    }
  }
  if (idx >= 0) {
    store.offlineSales[idx] = enrichedSale;
  } else {
    store.offlineSales.unshift(enrichedSale);
  }
  saveStore();
  res.json({ success: true, sale: enrichedSale });
});
app.post("/api/admin/orders/costs", requireAdminAuth, (req, res) => {
  const { orderId, isOffline, costs } = req.body;
  if (!orderId || !costs) {
    res.status(400).json({ error: "Order ID and costs are required" });
    return;
  }
  const list = isOffline ? store.offlineSales : store.onlineOrders;
  const order = list.find((o) => o.id === orderId);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  order.productCost = Number(costs.productCost) || 0;
  order.printingCost = Number(costs.printingCost) || 0;
  order.packagingCost = Number(costs.packagingCost) || 0;
  order.deliveryCost = Number(costs.deliveryCost) || 0;
  order.otherCost = Number(costs.otherCost) || 0;
  order.totalCost = order.productCost + order.printingCost + order.packagingCost + order.deliveryCost + order.otherCost;
  const selling = Number(order.finalAmount || order.sellingPrice) || 0;
  order.profit = selling - order.totalCost;
  order.profitMargin = selling > 0 ? parseFloat((order.profit / selling * 100).toFixed(1)) : 0;
  saveStore();
  res.json({ success: true, order });
});
app.post(["/api/admin/orders/status", "/api/admin/orders/update-status"], requireAdminAuth, (req, res) => {
  const { orderId, isOffline, newStatus, autoDeductStock } = req.body;
  const list = isOffline ? store.offlineSales : store.onlineOrders;
  const order = list.find((o) => o.id === orderId);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const prevStatus = order.orderStatus;
  order.orderStatus = newStatus;
  if (newStatus === "Cancelled" && order.stockDeducted) {
    executeStockRestoration(order);
    order.stockDeducted = false;
    order.deductedItems = [];
    saveStore();
    if (!isOffline) {
      void updateOrderInSheet(order.id, {
        "Order Status": "Cancelled"
      }).catch((syncErr) => {
        console.warn(`[Google Sheets] Async status update error for ${order.id}:`, syncErr?.message || syncErr);
      });
    }
    res.json({ success: true, order, restored: true, message: `Stock restored for cancelled order ${order.id}` });
    return;
  }
  if (!order.stockDeducted && (newStatus === "Processing" || newStatus === "Ready" || newStatus === "Delivered")) {
    const deductRes = executeStockDeduction({
      id: order.id,
      product: order.product,
      size: order.size,
      quality: order.quality,
      quantity: order.quantity,
      isOffline
    });
    if (!deductRes.success) {
      if (isOffline) {
        order.orderStatus = prevStatus;
        res.status(400).json({ error: deductRes.error, missingItems: deductRes.missingItems });
        return;
      }
    } else {
      order.stockDeducted = true;
      order.stockDeductedAt = (/* @__PURE__ */ new Date()).toISOString();
      order.deductedItems = deductRes.deductedItems;
    }
  }
  saveStore();
  if (!isOffline) {
    void updateOrderInSheet(order.id, {
      "Order Status": order.orderStatus
    }).catch((syncErr) => {
      console.warn(`[Google Sheets] Async status update error for ${order.id}:`, syncErr?.message || syncErr);
    });
  }
  res.json({ success: true, order });
});
app.post("/api/admin/inventory", requireAdminAuth, (req, res) => {
  const item = req.body;
  if (!item || !item.name) {
    res.status(400).json({ error: "Item name is required" });
    return;
  }
  const itemId = item.id || `INV-${Date.now().toString(36).toUpperCase()}`;
  const idx = store.inventory.findIndex((i) => i.id === itemId);
  const inventoryRecord = {
    id: itemId,
    name: item.name,
    category: item.category || "Frames",
    unit: item.unit || "pcs",
    currentStock: Math.max(0, Number(item.currentStock) || 0),
    minimumStock: Math.max(0, Number(item.minimumStock) || 5),
    purchaseCost: Math.max(0, Number(item.purchaseCost) || 0),
    supplier: item.supplier || "Local Supplier",
    active: item.active !== false,
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  };
  if (idx >= 0) {
    store.inventory[idx] = inventoryRecord;
  } else {
    store.inventory.push(inventoryRecord);
  }
  saveStore();
  res.json({ success: true, item: inventoryRecord });
});
app.post("/api/admin/purchases", requireAdminAuth, (req, res) => {
  const purchase = req.body;
  if (!purchase || !purchase.item) {
    res.status(400).json({ error: "Item name is required" });
    return;
  }
  const purchaseId = purchase.id || `PUR-${Date.now().toString(36).toUpperCase()}`;
  const qty = Math.max(1, Number(purchase.quantity) || 1);
  const unitCost = Math.max(0, Number(purchase.unitCost) || 0);
  const totalCost = unitCost * qty;
  const record = {
    id: purchaseId,
    purchaseDate: purchase.purchaseDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    item: purchase.item,
    inventoryItemId: purchase.inventoryItemId || void 0,
    category: purchase.category || "Frames",
    quantity: qty,
    unitCost,
    totalCost,
    supplier: purchase.supplier || "Local Vendor",
    paymentMethod: purchase.paymentMethod || "UPI",
    notes: purchase.notes || "",
    stockAdded: true,
    stockAddedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  let invItem = purchase.inventoryItemId ? store.inventory.find((i) => i.id === purchase.inventoryItemId) : store.inventory.find((i) => i.name.toLowerCase().trim() === purchase.item.toLowerCase().trim());
  if (invItem) {
    const prevStock = Number(invItem.currentStock || 0);
    invItem.currentStock = prevStock + qty;
    invItem.purchaseCost = unitCost;
    invItem.lastUpdated = record.purchaseDate;
    record.inventoryItemId = invItem.id;
    store.stockMovements.unshift({
      id: `STK-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      itemId: invItem.id,
      itemName: invItem.name,
      type: "Addition (Purchase)",
      quantity: qty,
      previousStock: prevStock,
      newStock: invItem.currentStock,
      referenceId: purchaseId,
      notes: `Stock auto-added from purchase ${purchaseId}`
    });
  }
  store.purchases.unshift(record);
  saveStore();
  res.json({ success: true, purchase: record });
});
app.post("/api/admin/expenses", requireAdminAuth, (req, res) => {
  const expense = req.body;
  if (!expense || !expense.expenseName) {
    res.status(400).json({ error: "Expense name is required" });
    return;
  }
  const expenseId = expense.id || `EXP-${Date.now().toString(36).toUpperCase()}`;
  const record = {
    id: expenseId,
    date: expense.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    expenseName: expense.expenseName,
    category: expense.category || "Operational",
    amount: Math.max(0, Number(expense.amount) || 0),
    paymentMethod: expense.paymentMethod || "UPI",
    notes: expense.notes || ""
  };
  const idx = store.expenses.findIndex((e) => e.id === expenseId);
  if (idx >= 0) {
    store.expenses[idx] = record;
  } else {
    store.expenses.unshift(record);
  }
  saveStore();
  res.json({ success: true, expense: record });
});
app.post("/api/admin/config/pricing", requireAdminAuth, (req, res) => {
  let { type, items, frameSizes, qualityTiers, stickerSizes, products } = req.body;
  if (!type) {
    if (Array.isArray(frameSizes)) {
      type = "frameSizes";
      items = frameSizes;
    } else if (Array.isArray(qualityTiers)) {
      type = "qualityTiers";
      items = qualityTiers;
    } else if (Array.isArray(stickerSizes)) {
      type = "stickerSizes";
      items = stickerSizes;
    } else if (Array.isArray(products)) {
      type = "products";
      items = products;
    }
  }
  if (type === "frameSizes" && Array.isArray(items)) {
    store.frameSizes = items.map((item) => {
      const orig = Math.max(0, Number(item.originalPrice ?? item.basePrice) || 0);
      let discPrice = item.discountedPrice !== null && item.discountedPrice !== void 0 ? Math.max(0, Number(item.discountedPrice)) : null;
      let discPercent = item.discountPercentage !== null && item.discountPercentage !== void 0 ? Math.max(0, Math.min(100, Number(item.discountPercentage))) : null;
      if (item.discountActive) {
        if (discPrice !== null && discPercent === null && orig > 0) {
          discPercent = Math.round((orig - discPrice) / orig * 100);
        } else if (discPercent !== null && discPrice === null && orig > 0) {
          discPrice = Math.round(orig * (1 - discPercent / 100));
        }
      }
      return {
        ...item,
        originalPrice: orig,
        discountedPrice: discPrice,
        discountPercentage: discPercent,
        discountActive: Boolean(item.discountActive),
        basePrice: discPrice !== null && item.discountActive ? discPrice : orig
      };
    });
  } else if (type === "qualityTiers" && Array.isArray(items)) {
    store.qualityTiers = items.map((item) => ({
      ...item,
      originalPriceDelta: Math.max(0, Number(item.originalPriceDelta ?? item.priceAdjustment) || 0),
      discountedPriceDelta: item.discountedPriceDelta !== null && item.discountedPriceDelta !== void 0 ? Math.max(0, Number(item.discountedPriceDelta)) : null,
      discountActive: Boolean(item.discountActive),
      priceAdjustment: item.discountActive && item.discountedPriceDelta !== null ? Number(item.discountedPriceDelta) : Number(item.originalPriceDelta || 0)
    }));
  } else if (type === "stickerSizes" && Array.isArray(items)) {
    store.stickerSizes = items.map((item) => {
      const orig = Math.max(0, Number(item.originalPrice ?? item.price) || 0);
      let discPrice = item.discountedPrice !== null && item.discountedPrice !== void 0 ? Math.max(0, Number(item.discountedPrice)) : null;
      let discPercent = item.discountPercentage !== null && item.discountPercentage !== void 0 ? Math.max(0, Math.min(100, Number(item.discountPercentage))) : null;
      if (item.discountActive) {
        if (discPrice !== null && discPercent === null && orig > 0) {
          discPercent = Math.round((orig - discPrice) / orig * 100);
        } else if (discPercent !== null && discPrice === null && orig > 0) {
          discPrice = Math.round(orig * (1 - discPercent / 100));
        }
      }
      return {
        ...item,
        originalPrice: orig,
        discountedPrice: discPrice,
        discountPercentage: discPercent,
        discountActive: Boolean(item.discountActive),
        price: discPrice !== null && item.discountActive ? discPrice : orig
      };
    });
  } else if (type === "products" && Array.isArray(items)) {
    store.products = items.map((item) => ({
      ...item,
      originalStartingPrice: Math.max(0, Number(item.originalStartingPrice ?? item.startingPrice) || 0),
      discountedStartingPrice: item.discountedStartingPrice !== null && item.discountedStartingPrice !== void 0 ? Math.max(0, Number(item.discountedStartingPrice)) : null,
      discountActive: Boolean(item.discountActive),
      startingPrice: item.discountActive && item.discountedStartingPrice !== null ? Number(item.discountedStartingPrice) : Number(item.originalStartingPrice || 0)
    }));
  }
  saveStore();
  res.json({ success: true, message: "Pricing configuration updated" });
});
function sanitizeReviewInput(r) {
  if (!r || typeof r !== "object") {
    return { valid: false, error: "Review payload must be a valid object" };
  }
  const customerName = typeof r.customerName === "string" ? r.customerName.trim() : typeof r.name === "string" ? r.name.trim() : "";
  if (!customerName) {
    return { valid: false, error: "Customer Name is required and cannot be empty" };
  }
  const reviewText = typeof r.reviewText === "string" ? r.reviewText.trim() : typeof r.comment === "string" ? r.comment.trim() : "";
  if (!reviewText) {
    return { valid: false, error: "Review Text is required and cannot be empty" };
  }
  const rating = Number(r.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { valid: false, error: "Rating must be an integer between 1 and 5" };
  }
  let displayOrder = Number(r.displayOrder);
  if (isNaN(displayOrder) || displayOrder < 1) {
    displayOrder = 1;
  }
  let customerPhoto = "";
  const rawUrl = r.customerPhoto || r.imageUrl || r.image || r.avatarUrl;
  if (typeof rawUrl === "string") {
    const trimmed = rawUrl.trim();
    const lower = trimmed.toLowerCase();
    if (!lower.startsWith("javascript:") && !lower.startsWith("data:") && !lower.startsWith("file:") && !lower.startsWith("vbscript:")) {
      customerPhoto = trimmed;
    }
  }
  const location = typeof r.location === "string" ? r.location.trim().substring(0, 100) : "";
  const date = typeof r.date === "string" ? r.date.trim().substring(0, 50) : "";
  const productPurchased = typeof r.productPurchased === "string" ? r.productPurchased.trim().substring(0, 100) : "";
  const visible = r.visible !== false && r.active !== false;
  const active = visible;
  const featured = Boolean(r.featured);
  const verified = r.verified !== false;
  const id = typeof r.id === "string" && r.id.trim() ? r.id.trim() : `REV-${Date.now().toString(36).toUpperCase()}`;
  return {
    valid: true,
    review: {
      id,
      customerName,
      name: customerName,
      reviewText,
      comment: reviewText,
      rating,
      customerPhoto,
      imageUrl: customerPhoto,
      avatarUrl: customerPhoto,
      location,
      date,
      productPurchased,
      visible,
      active,
      featured,
      displayOrder,
      verified
    }
  };
}
app.post("/api/admin/config/content", requireAdminAuth, (req, res) => {
  let { type, data, faqs, reviews, offers, existingDesigns, homepageHero, homepageSections, websiteSettings, whatsappTemplates } = req.body;
  if (!type) {
    if (Array.isArray(faqs)) {
      type = "faqs";
      data = faqs;
    } else if (Array.isArray(reviews)) {
      type = "reviews";
      data = reviews;
    } else if (Array.isArray(offers)) {
      type = "offers";
      data = offers;
    } else if (Array.isArray(existingDesigns)) {
      type = "existingDesigns";
      data = existingDesigns;
    } else if (homepageHero && typeof homepageHero === "object") {
      type = "homepageHero";
      data = homepageHero;
    } else if (Array.isArray(homepageSections)) {
      type = "homepageSections";
      data = homepageSections;
    } else if (websiteSettings && typeof websiteSettings === "object") {
      type = "websiteSettings";
      data = websiteSettings;
    } else if (Array.isArray(whatsappTemplates)) {
      type = "whatsappTemplates";
      data = whatsappTemplates;
    }
  }
  if (type === "faqs" && Array.isArray(data)) {
    store.faqs = data;
  } else if (type === "reviews" && Array.isArray(data)) {
    const validatedReviews = [];
    for (let i = 0; i < data.length; i++) {
      const v = sanitizeReviewInput(data[i]);
      if (!v.valid) {
        return res.status(400).json({ success: false, error: `Review #${i + 1} validation failed: ${v.error}` });
      }
      validatedReviews.push(v.review);
    }
    store.reviews = validatedReviews;
  } else if (type === "offers" && Array.isArray(data)) {
    store.offers = data;
  } else if (type === "existingDesigns" && Array.isArray(data)) {
    store.existingDesigns = data.map((d) => {
      let driveUrl = typeof d.driveUrl === "string" ? d.driveUrl.trim() : "";
      const lower = driveUrl.toLowerCase();
      if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("file:") || lower.startsWith("vbscript:")) {
        driveUrl = "";
      }
      return { ...d, driveUrl };
    });
  } else if (type === "homepageHero" && data && typeof data === "object") {
    store.homepageHero = data;
  } else if (type === "homepageSections" && Array.isArray(data)) {
    store.homepageSections = data;
  } else if (type === "websiteSettings" && data && typeof data === "object") {
    store.websiteSettings = { ...store.websiteSettings, ...data };
  } else if (type === "whatsappTemplates" && Array.isArray(data)) {
    store.whatsappTemplates = data;
  }
  saveStore();
  res.json({ success: true, message: "Content configuration updated" });
});
app.get("/api/admin/reviews", requireAdminAuth, (_req, res) => {
  res.json({
    success: true,
    reviews: (store.reviews || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  });
});
app.post("/api/admin/reviews", requireAdminAuth, (req, res) => {
  const v = sanitizeReviewInput(req.body);
  if (!v.valid) {
    return res.status(400).json({ success: false, error: v.error });
  }
  if (!store.reviews) store.reviews = [];
  store.reviews.push(v.review);
  saveStore();
  res.status(201).json({ success: true, review: v.review, message: "Review created successfully" });
});
app.put("/api/admin/reviews/:id", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  if (!store.reviews) store.reviews = [];
  const idx = store.reviews.findIndex((r) => r.id === id);
  if (idx < 0) {
    return res.status(404).json({ success: false, error: `Review with ID "${id}" not found` });
  }
  const v = sanitizeReviewInput({ ...store.reviews[idx], ...req.body, id });
  if (!v.valid) {
    return res.status(400).json({ success: false, error: v.error });
  }
  store.reviews[idx] = v.review;
  saveStore();
  res.json({ success: true, review: v.review, message: "Review updated successfully" });
});
app.delete("/api/admin/reviews/:id", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  if (!store.reviews) store.reviews = [];
  const initialLength = store.reviews.length;
  store.reviews = store.reviews.filter((r) => r.id !== id);
  if (store.reviews.length === initialLength) {
    return res.status(404).json({ success: false, error: `Review with ID "${id}" not found` });
  }
  saveStore();
  res.json({ success: true, message: "Review deleted successfully" });
});
app.get("/api/public/reviews", (_req, res) => {
  const publicReviews = (store.reviews || []).filter((r) => r.active !== false && r.visible !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((r) => ({
    id: r.id,
    customerName: r.customerName || r.name,
    name: r.customerName || r.name,
    reviewText: r.reviewText || r.comment,
    comment: r.reviewText || r.comment,
    rating: r.rating,
    date: r.date || "",
    location: r.location || "",
    imageUrl: r.imageUrl || r.customerPhoto || "",
    customerPhoto: r.customerPhoto || r.imageUrl || "",
    featured: Boolean(r.featured),
    displayOrder: r.displayOrder || 0,
    verified: r.verified !== false,
    productPurchased: r.productPurchased || ""
  }));
  res.json({
    success: true,
    reviews: publicReviews
  });
});
app.get("/api/admin/analytics", requireAdminAuth, (req, res) => {
  const month = req.query.month || (/* @__PURE__ */ new Date()).toISOString().substring(0, 7);
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const onlineInMonth = store.onlineOrders.filter((o) => o.createdDate?.startsWith(month));
  const offlineInMonth = store.offlineSales.filter((o) => o.orderDate?.startsWith(month));
  const purchasesInMonth = store.purchases.filter((p) => p.purchaseDate?.startsWith(month));
  const expensesInMonth = store.expenses.filter((e) => e.date?.startsWith(month));
  const onlineSales = onlineInMonth.filter((o) => o.orderStatus !== "Cancelled").reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0);
  const offlineSales = offlineInMonth.filter((o) => o.orderStatus !== "Cancelled").reduce((sum, o) => sum + (Number(o.sellingPrice || o.finalAmount) || 0), 0);
  const totalMonthlySales = onlineSales + offlineSales;
  const totalOrderCosts = onlineInMonth.reduce((sum, o) => sum + (Number(o.totalCost) || 0), 0) + offlineInMonth.reduce((sum, o) => sum + (Number(o.totalCost) || 0), 0);
  const totalPurchases = purchasesInMonth.reduce((sum, p) => sum + (Number(p.totalCost) || 0), 0);
  const totalExpenses = expensesInMonth.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const grossProfit = totalMonthlySales - totalOrderCosts;
  const netProfit = totalMonthlySales - (totalOrderCosts + totalExpenses);
  const profitMargin = totalMonthlySales > 0 ? parseFloat((netProfit / totalMonthlySales * 100).toFixed(1)) : 0;
  const todayOnline = store.onlineOrders.filter((o) => o.createdDate === today);
  const todayOffline = store.offlineSales.filter((o) => o.orderDate === today);
  const todaySales = todayOnline.reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0) + todayOffline.reduce((sum, o) => sum + (Number(o.sellingPrice || o.finalAmount) || 0), 0);
  const lowStockCount = store.inventory.filter((i) => i.active && i.currentStock <= i.minimumStock).length;
  const pendingOrders = store.onlineOrders.filter((o) => o.orderStatus === "Pending" || o.orderStatus === "Processing").length + store.offlineSales.filter((o) => o.orderStatus === "Pending" || o.orderStatus === "Processing").length;
  res.json({
    month,
    todayOrdersCount: todayOnline.length + todayOffline.length,
    todaySales,
    pendingOrders,
    lowStockItemsCount: lowStockCount,
    monthlySales: totalMonthlySales,
    onlineSales,
    offlineSales,
    totalMonthlyOrders: onlineInMonth.length + offlineInMonth.length,
    deliveredOrders: onlineInMonth.filter((o) => o.orderStatus === "Delivered").length + offlineInMonth.filter((o) => o.orderStatus === "Delivered").length,
    cancelledOrders: onlineInMonth.filter((o) => o.orderStatus === "Cancelled").length + offlineInMonth.filter((o) => o.orderStatus === "Cancelled").length,
    purchases: totalPurchases,
    expenses: totalExpenses,
    totalCosts: totalOrderCosts + totalExpenses,
    grossProfit,
    netProfit,
    profitMargin
  });
});
app.post("/api/admin/clear-all", requireAdminAuth, (req, res) => {
  store.onlineOrders = [];
  store.offlineSales = [];
  store.customers = [];
  store.inventory = [];
  store.stockMovements = [];
  store.purchases = [];
  store.expenses = [];
  store.activityLog = [];
  saveStore();
  res.json({ success: true, message: "All business records cleared." });
});
app.all(["/api", "/api/*"], (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
});
app.use((err, req, res, _next) => {
  console.error("[API Server Error]", err);
  if (!res.headersSent) {
    const status = typeof err?.status === "number" && err.status >= 400 && err.status < 600 ? err.status : typeof err?.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;
    res.setHeader("Content-Type", "application/json");
    res.status(status).json({
      error: err?.message || "An internal server error occurred",
      success: false
    });
  }
});
async function startServer() {
  if (!isProduction) {
    const vitePkg = "vite";
    const { createServer: createViteServer } = await import(
      /* @vite-ignore */
      vitePkg
    );
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path2.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path2.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
  MomentPress Studio Ready:
`);
    console.log(`  \u279C  Local:   http://localhost:${PORT}/`);
    try {
      const nets = os2.networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name] || []) {
          if (net.family === "IPv4" && !net.internal) {
            console.log(`  \u279C  Network: http://${net.address}:${PORT}/ (${name})`);
          }
        }
      }
    } catch (_) {
    }
    console.log(`  \u279C  Admin:   http://localhost:${PORT}/admin/2008
`);
  });
}
var isDirectExecution = Boolean(
  process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === path2.resolve(process.argv[1]).toLowerCase()
);
if (isDirectExecution && !process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}
var server_default = app;
export {
  app,
  server_default as default,
  startServer
};
