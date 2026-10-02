import dotenv from 'dotenv';
dotenv.config();

import { uploadBillToGoogleDrive, getGoogleDriveAuthType } from '../src/lib/drive/google-drive-service.ts';

async function testUpload() {
  console.log('Detected Auth Type:', getGoogleDriveAuthType());
  
  const dummyBuffer = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n115\n%%EOF',
    'utf8'
  );

  console.log('Testing live upload to Google Drive folder 1TB6Vfcj6AID8IR66OKcLZ7FbwYX8cPnq...');
  const result = await uploadBillToGoogleDrive({
    orderId: 'MP-TEST',
    pdfBuffer: dummyBuffer,
    fileName: 'MomentPress-Bill-MP-TEST.pdf',
    forceReupload: false,
  });

  console.log('Upload Result:');
  console.log('  Status:', result.status);
  console.log('  Message:', result.message);
  console.log('  Folder ID:', result.folderId);
  console.log('  File ID:', result.fileId || 'N/A');
  console.log('  WebViewLink:', result.webViewLink || 'N/A');
  console.log('  Reused:', result.reused);
}

testUpload();
