/**
 * Google Sheets Secondary Order Synchronization Service
 *
 * Synchronizes online orders and status updates to Google Sheets via Google Apps Script Web App.
 *
 * ARCHITECTURAL CONSTRAINTS:
 * - Local JSON store is the authoritative primary source of truth.
 * - Google Sheets is a secondary synchronized copy.
 * - Backend is the sole authority for Order IDs (MP-X).
 * - All sync operations are non-blocking and never throw errors into user/admin flows.
 * - Never exposes or logs the sync secret.
 */

export interface GoogleSheetsSyncResult {
  success: boolean;
  duplicate?: boolean;
  created?: boolean;
  updated?: boolean;
  orderId?: string;
  error?: string;
}

export interface GoogleSheetOrderRow {
  'Order ID': string;
  'Order Date': string;
  'Customer Name': string;
  'WhatsApp': string;
  'Delivery Address': string;
  'Product': string;
  'Size': string;
  'Dimensions': string;
  'Quality': string;
  'Quantity': number;
  'Requirements': string;
  'Subtotal': number;
  'Discount': number;
  'Final Total': number;
  'Order Status': string;
  'Bill Number': string;
  'Bill Drive Link': string;
  'Bill Generated At': string;
}

/**
 * Derives dimensions dynamically from existing backend configuration or standard sizing.
 */
export function deriveOrderDimensions(
  productName?: string,
  sizeName?: string,
  frameSizes?: Array<{ id?: string; name?: string; dimensions?: string }>
): string {
  if (!sizeName) return '';
  const rawSize = String(sizeName).trim();
  const lowerSize = rawSize.toLowerCase();

  // 1. Check against active backend frame sizes configuration if passed
  if (Array.isArray(frameSizes)) {
    const matched = frameSizes.find((fs) => {
      const fsId = String(fs.id || '').toLowerCase();
      const fsName = String(fs.name || '').toLowerCase();
      return (
        fsId === lowerSize ||
        fsName === lowerSize ||
        fsName.replace(/[×x]/g, 'x') === lowerSize.replace(/[×x]/g, 'x')
      );
    });
    if (matched && matched.dimensions) {
      return matched.dimensions;
    }
  }

  // 2. Standard catalogue dimensional mapping for MomentPress
  const cleanKey = lowerSize.replace(/[×x]/g, 'x').replace(/[^0-9x]/g, '');
  const staticMap: Record<string, string> = {
    '5x7': '15 x 20 cm (5x7 in)', // wait, 5x7 is 13 x 18 cm
    '6x8': '15 x 20 cm (6x8 in)',
    '8x10': '20 x 25 cm (8x10 in)',
    '10x12': '25 x 30 cm (10x12 in)',
    '12x18': '30 x 45 cm (12x18 in)',
    '2x2': '5 x 5 cm (2x2 in)',
    '3x3': '7.6 x 7.6 cm (3x3 in)',
    '4x4': '10 x 10 cm (4x4 in)',
  };
  staticMap['5x7'] = '13 x 18 cm (5x7 in)';

  if (staticMap[cleanKey]) {
    return staticMap[cleanKey];
  }

  return rawSize;
}

/**
 * Converts a backend order object to the authoritative 18-column Google Sheet schema.
 */
export function mapOrderToSheetRow(
  order: any,
  frameSizes?: Array<{ id?: string; name?: string; dimensions?: string }>
): GoogleSheetOrderRow {
  const quantity = Number(order.quantity) || 1;
  const unitPrice = Number(order.unitPrice) || 0;
  const subtotal = unitPrice * quantity;
  const discount = Number(order.discount) || 0;
  const finalTotal = Number(order.finalAmount) || subtotal - discount;

  const address = order.address ? String(order.address).trim() : '';
  const city = order.city ? String(order.city).trim() : 'Kolkata';
  const pincode = order.pincode ? String(order.pincode).trim() : '';
  const formattedAddress = pincode ? `${address}, ${city} - ${pincode}` : address ? `${address}, ${city}` : city;

  return {
    'Order ID': String(order.id || ''),
    'Order Date': String(order.createdDate || order.orderDate || new Date().toISOString().split('T')[0]),
    'Customer Name': String(order.customerName || ''),
    'WhatsApp': String(order.mobileNumber || ''),
    'Delivery Address': formattedAddress,
    'Product': String(order.product || ''),
    'Size': String(order.size || ''),
    'Dimensions': deriveOrderDimensions(order.product, order.size, frameSizes),
    'Quality': String(order.quality || ''),
    'Quantity': quantity,
    'Requirements': String(order.requirements || ''),
    'Subtotal': subtotal,
    'Discount': discount,
    'Final Total': finalTotal,
    'Order Status': String(order.orderStatus || 'Pending'),
    'Bill Number': String(order.billNumber || ''),
    'Bill Drive Link': String(order.billDriveUrl || ''),
    'Bill Generated At': String(order.billGeneratedAt || ''),
  };
}

/**
 * Maps incoming backend order updates to allowed 18-column Google Sheet field names.
 * Ensures "Order ID" is NEVER sent inside the updates object.
 */
export function mapUpdatesToSheetFields(updates: Record<string, any>): Record<string, any> {
  const mapped: Record<string, any> = {};

  const allowedColumns = new Set([
    'Order Date',
    'Customer Name',
    'WhatsApp',
    'Delivery Address',
    'Product',
    'Size',
    'Dimensions',
    'Quality',
    'Quantity',
    'Requirements',
    'Subtotal',
    'Discount',
    'Final Total',
    'Order Status',
    'Bill Number',
    'Bill Drive Link',
    'Bill Generated At',
  ]);

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'Order ID' || key === 'id' || key === 'orderId') {
      continue; // NEVER send Order ID inside updates
    }

    if (allowedColumns.has(key)) {
      mapped[key] = value;
      continue;
    }

    // Map common backend property names to sheet column headers
    switch (key) {
      case 'orderStatus':
        mapped['Order Status'] = value;
        break;
      case 'billNumber':
        mapped['Bill Number'] = value;
        break;
      case 'billDriveUrl':
        mapped['Bill Drive Link'] = value;
        break;
      case 'billGeneratedAt':
        mapped['Bill Generated At'] = value;
        break;
      case 'customerName':
        mapped['Customer Name'] = value;
        break;
      case 'mobileNumber':
        mapped['WhatsApp'] = value;
        break;
      case 'requirements':
        mapped['Requirements'] = value;
        break;
      case 'quality':
        mapped['Quality'] = value;
        break;
      case 'size':
        mapped['Size'] = value;
        break;
      case 'quantity':
        mapped['Quantity'] = Number(value);
        break;
      case 'unitPrice':
        if (updates.quantity) {
          mapped['Subtotal'] = Number(value) * Number(updates.quantity);
        }
        break;
      case 'discount':
        mapped['Discount'] = Number(value);
        break;
      case 'finalAmount':
        mapped['Final Total'] = Number(value);
        break;
      case 'address':
      case 'city':
      case 'pincode':
        if (updates.address || updates.city || updates.pincode) {
          const addr = updates.address || '';
          const c = updates.city || 'Kolkata';
          const pin = updates.pincode || '';
          mapped['Delivery Address'] = pin ? `${addr}, ${c} - ${pin}` : `${addr}, ${c}`;
        }
        break;
    }
  }

  return mapped;
}

/**
 * Sends a POST request to Google Apps Script Web App with timeout and redirect handling.
 */
async function postToAppsScript(payload: Record<string, any>, orderIdForLog?: string): Promise<GoogleSheetsSyncResult> {
  const webAppUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  const secret = process.env.GOOGLE_SHEETS_SYNC_SECRET;

  if (!webAppUrl || !webAppUrl.trim()) {
    console.warn('[Google Sheets] Sync skipped: GOOGLE_SHEETS_WEBAPP_URL not configured');
    return { success: false, error: 'GOOGLE_SHEETS_WEBAPP_URL not configured' };
  }

  if (!secret || !secret.trim()) {
    console.warn('[Google Sheets] Sync skipped: GOOGLE_SHEETS_SYNC_SECRET not configured');
    return { success: false, error: 'GOOGLE_SHEETS_SYNC_SECRET not configured' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const bodyToSend = JSON.stringify({
      ...payload,
      secret,
    });

    const response = await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyToSend,
      redirect: 'follow', // Follow 302 redirect from Google Apps Script
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[Google Sheets] HTTP error ${response.status} for order: ${orderIdForLog || 'unknown'}`);
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data: any = await response.json();

    // Check for success
    if (data && data.success === true) {
      // Both created and duplicate (idempotent duplicate) are treated as successful sync
      return {
        success: true,
        created: Boolean(data.created),
        duplicate: Boolean(data.duplicate),
        updated: Boolean(data.updated),
        orderId: data.orderId || orderIdForLog,
      };
    }

    console.warn(`[Google Sheets] API reported failure for order ${orderIdForLog || 'unknown'}: ${data?.error || data?.message || 'Unknown error'}`);
    return {
      success: false,
      error: data?.error || data?.message || 'Apps Script returned success: false',
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn(`[Google Sheets] Sync timed out after 5s for order: ${orderIdForLog || 'unknown'}`);
      return { success: false, error: 'Request timeout' };
    }
    console.warn(`[Google Sheets] Sync network error for order ${orderIdForLog || 'unknown'}: ${err?.message || err}`);
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Asynchronously appends a new order row to the Online Orders sheet.
 * Non-blocking, fails safely, never throws.
 */
export async function appendOrderToSheet(
  order: any,
  frameSizes?: Array<{ id?: string; name?: string; dimensions?: string }>
): Promise<GoogleSheetsSyncResult> {
  try {
    if (!order || !order.id) {
      return { success: false, error: 'Invalid order object' };
    }

    const sheetRow = mapOrderToSheetRow(order, frameSizes);

    const payload = {
      action: 'createOrder',
      order: sheetRow,
    };

    return await postToAppsScript(payload, order.id);
  } catch (err: any) {
    console.warn(`[Google Sheets] Unexpected error appending order ${order?.id || 'unknown'}: ${err?.message || err}`);
    return { success: false, error: err?.message || 'Unexpected error' };
  }
}

/**
 * Asynchronously updates an existing order row in the Online Orders sheet.
 * Non-blocking, fails safely, never throws.
 */
export async function updateOrderInSheet(
  orderId: string,
  updates: Record<string, any>
): Promise<GoogleSheetsSyncResult> {
  try {
    if (!orderId) {
      return { success: false, error: 'Missing orderId' };
    }

    const sheetUpdates = mapUpdatesToSheetFields(updates);

    if (Object.keys(sheetUpdates).length === 0) {
      return { success: true }; // Nothing to update in sheet schema
    }

    const payload = {
      action: 'updateOrder',
      orderId: String(orderId),
      updates: sheetUpdates,
    };

    return await postToAppsScript(payload, orderId);
  } catch (err: any) {
    console.warn(`[Google Sheets] Unexpected error updating order ${orderId}: ${err?.message || err}`);
    return { success: false, error: err?.message || 'Unexpected error' };
  }
}
