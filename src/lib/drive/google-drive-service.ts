/**
 * Google Drive Bill Storage Service
 * Handles uploading generated invoice PDFs to Google Drive:
 * - Target folder ID: 1TB6Vfcj6AID8IR66OKcLZ7FbwYX8cPnq (or GOOGLE_DRIVE_FOLDER_ID from environment)
 * - Filename format: MomentPress-Bill-MP-{ORDER_ID}.pdf
 * - Authentication: Google Service Account (GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS)
 * - Permissions: Reader for anyone with link (exposing ONLY the specific bill PDF, not the parent folder)
 * - Duplicate prevention: Reuses existing Drive file ID / URL for the same order without creating duplicate copies
 *
 * If credentials are not configured or folder permission is blocked, cleanly reports:
 * status: "BLOCKED_CONFIG_REQUIRED" or "ERROR" with exact blocked details without faking a successful upload.
 */

export const DEFAULT_BILL_FOLDER_ID = '1TB6Vfcj6AID8IR66OKcLZ7FbwYX8cPnq';

export interface GoogleDriveUploadResult {
  status: 'VERIFIED' | 'BLOCKED_CONFIG_REQUIRED' | 'ERROR';
  message: string;
  folderPath: string;
  folderId: string;
  fileName: string;
  fileId?: string;
  webViewLink?: string;
  webContentLink?: string;
  uploadedAt?: string;
  reused?: boolean;
}

export function getGoogleDriveFolderId(): string {
  return (process.env.GOOGLE_DRIVE_FOLDER_ID && process.env.GOOGLE_DRIVE_FOLDER_ID.trim()) || DEFAULT_BILL_FOLDER_ID;
}

export function formatBillFileName(orderId: string): string {
  const numericSuffix = String(orderId || '').replace(/^MP-/i, '').trim();
  return `MomentPress-Bill-MP-${numericSuffix || orderId}.pdf`;
}

export function getGoogleDriveAuthType(): 'SERVICE_ACCOUNT' | 'OAUTH_REFRESH_TOKEN' | 'NONE' {
  if (
    (process.env.GOOGLE_SERVICE_ACCOUNT_KEY && process.env.GOOGLE_SERVICE_ACCOUNT_KEY.trim()) ||
    (process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_APPLICATION_CREDENTIALS.trim())
  ) {
    return 'SERVICE_ACCOUNT';
  }
  if (process.env.GOOGLE_DRIVE_CLIENT_ID && process.env.GOOGLE_DRIVE_REFRESH_TOKEN) {
    return 'OAUTH_REFRESH_TOKEN';
  }
  return 'NONE';
}

export function isGoogleDriveConfigured(): boolean {
  return getGoogleDriveAuthType() !== 'NONE';
}

/**
 * Builds multipart/related HTTP request body for Google Drive v3 REST API upload.
 */
function buildMultipartBody(
  metadata: Record<string, any>,
  fileBuffer: Buffer,
  boundary = '-------MomentPressDriveBoundary' + Date.now()
): { body: Buffer; boundary: string } {
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/pdf\r\n\r\n';

  const metadataBuffer = Buffer.from(metadataPart, 'utf8');
  const closeBuffer = Buffer.from(closeDelimiter, 'utf8');

  return {
    body: Buffer.concat([metadataBuffer, fileBuffer, closeBuffer]),
    boundary,
  };
}

export async function uploadBillToGoogleDrive(params: {
  orderId: string;
  pdfBuffer: Buffer;
  fileName?: string;
  existingFileId?: string;
  existingDriveUrl?: string;
  existingDownloadUrl?: string;
  existingUploadedAt?: string;
  forceReupload?: boolean;
}): Promise<GoogleDriveUploadResult> {
  const folderId = getGoogleDriveFolderId();
  const folderPath = `Google Drive Folder (${folderId})`;
  const fileName = params.fileName || formatBillFileName(params.orderId);

  // 1. Duplicate Prevention: Reuse existing file information stored on order if already uploaded
  if (!params.forceReupload && params.existingFileId && params.existingDriveUrl) {
    return {
      status: 'VERIFIED',
      message: 'Reused existing Google Drive bill file (duplicate upload prevented).',
      folderPath,
      folderId,
      fileName,
      fileId: params.existingFileId,
      webViewLink: params.existingDriveUrl,
      webContentLink: params.existingDownloadUrl,
      uploadedAt: params.existingUploadedAt || new Date().toISOString(),
      reused: true,
    };
  }

  // 2. Authentication Check
  const authType = getGoogleDriveAuthType();
  if (authType === 'NONE') {
    const hasClientId = Boolean(process.env.GOOGLE_DRIVE_CLIENT_ID?.trim());
    const detailMsg = hasClientId
      ? `Google Drive OAuth Client ID is configured, but GOOGLE_DRIVE_REFRESH_TOKEN is missing. Generate and add GOOGLE_DRIVE_REFRESH_TOKEN to .env.`
      : `Google Drive credentials are not configured. Target folder ID configured: ${folderId}. Set GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, and GOOGLE_DRIVE_REFRESH_TOKEN (or Service Account) in .env for automatic cloud upload.`;

    return {
      status: 'BLOCKED_CONFIG_REQUIRED',
      message: detailMsg,
      folderPath,
      folderId,
      fileName,
    };
  }

  try {
    // 3. Acquire Google Drive API Access Token
    let accessToken: string | null | undefined = null;
    const { GoogleAuth, OAuth2Client } = await import('google-auth-library');

    if (authType === 'OAUTH_REFRESH_TOKEN') {
      const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID?.trim();
      const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET?.trim();
      const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim();

      const oauth2Client = new OAuth2Client(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const tokenResponse = await oauth2Client.getAccessToken();
      accessToken = tokenResponse?.token;

      if (!accessToken) {
        return {
          status: 'ERROR',
          message: 'Failed to acquire access token from Google Drive OAuth refresh token. Verify GOOGLE_DRIVE_REFRESH_TOKEN, CLIENT_ID, and CLIENT_SECRET.',
          folderPath,
          folderId,
          fileName,
        };
      }
    } else if (authType === 'SERVICE_ACCOUNT') {
      let auth: any = null;
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        let credentials;
        try {
          credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        } catch (jsonErr: any) {
          return {
            status: 'ERROR',
            message: `Invalid GOOGLE_SERVICE_ACCOUNT_KEY JSON format: ${jsonErr?.message || jsonErr}`,
            folderPath,
            folderId,
            fileName,
          };
        }
        auth = new GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        auth = new GoogleAuth({
          keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
      }

      if (!auth) {
        return {
          status: 'BLOCKED_CONFIG_REQUIRED',
          message: 'Google Drive Service Account credentials not recognized.',
          folderPath,
          folderId,
          fileName,
        };
      }

      const client = await auth.getClient();
      const tokenResponse = await client.getAccessToken();
      accessToken = tokenResponse?.token;

      if (!accessToken) {
        return {
          status: 'ERROR',
          message: 'Failed to acquire access token from Google Service Account credentials.',
          folderPath,
          folderId,
          fileName,
        };
      }
    }

    if (!accessToken) {
      return {
        status: 'BLOCKED_CONFIG_REQUIRED',
        message: 'Unable to authenticate with Google Drive API.',
        folderPath,
        folderId,
        fileName,
      };
    }

    const authHeaders = {
      Authorization: `Bearer ${accessToken}`,
    };

    // 4. Remote Duplicate Check: Search target folder for existing file with same name
    if (!params.forceReupload) {
      const escapedFileName = fileName.replace(/'/g, "\\'");
      const searchQuery = encodeURIComponent(`'${folderId}' in parents and name = '${escapedFileName}' and trashed = false`);
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${searchQuery}&fields=files(id,name,webViewLink,webContentLink)`,
        { headers: authHeaders }
      );

      if (searchRes.ok) {
        const searchJson = await searchRes.json() as any;
        const existing = searchJson.files && searchJson.files[0];
        if (existing && existing.id) {
          // File already exists in the folder - ensure permission is set and reuse
          try {
            await fetch(`https://www.googleapis.com/drive/v3/files/${existing.id}/permissions`, {
              method: 'POST',
              headers: { ...authHeaders, 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: 'reader', type: 'anyone' }),
            });
          } catch {
            // Non-critical if permission already existed
          }

          const webViewLink = existing.webViewLink || `https://drive.google.com/file/d/${existing.id}/view?usp=sharing`;
          const webContentLink = existing.webContentLink || `https://drive.google.com/uc?id=${existing.id}&export=download`;

          return {
            status: 'VERIFIED',
            message: 'Existing Google Drive bill found in folder and reused (duplicate upload prevented).',
            folderPath,
            folderId,
            fileName,
            fileId: existing.id,
            webViewLink,
            webContentLink,
            uploadedAt: new Date().toISOString(),
            reused: true,
          };
        }
      }
    }

    // 5. Upload New File to Specific Folder
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
      description: `MomentPress Official Customer Invoice for Order ${params.orderId}`,
    };

    const { body: multipartData, boundary } = buildMultipartBody(fileMetadata, params.pdfBuffer);

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
      {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': `multipart/related; boundary=${boundary}`,
          'Content-Length': String(multipartData.length),
        },
        body: new Uint8Array(multipartData) as unknown as BodyInit,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      let parsedErr = errText;
      try {
        const parsed = JSON.parse(errText);
        parsedErr = parsed?.error?.message || errText;
      } catch {
        // Keep raw text
      }

      if (uploadRes.status === 404 || uploadRes.status === 403) {
        return {
          status: 'ERROR',
          message: `Google Drive upload blocked: Folder ${folderId} is not accessible. Please ensure folder is shared with the Service Account email with Editor permission. Details: ${parsedErr}`,
          folderPath,
          folderId,
          fileName,
        };
      }

      return {
        status: 'ERROR',
        message: `Google Drive upload failed (HTTP ${uploadRes.status}): ${parsedErr}`,
        folderPath,
        folderId,
        fileName,
      };
    }

    const uploadJson = (await uploadRes.json()) as any;
    const fileId = uploadJson.id;

    // 6. Grant Reader Permission to Anyone with Link (ONLY for this specific PDF, not folder)
    if (fileId) {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      });
    }

    const webViewLink = uploadJson.webViewLink || `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    const webContentLink = uploadJson.webContentLink || `https://drive.google.com/uc?id=${fileId}&export=download`;

    return {
      status: 'VERIFIED',
      message: 'Invoice successfully uploaded to Google Drive.',
      folderPath,
      folderId,
      fileName,
      fileId,
      webViewLink,
      webContentLink,
      uploadedAt: new Date().toISOString(),
      reused: false,
    };
  } catch (error: any) {
    return {
      status: 'ERROR',
      message: `Google Drive upload error: ${error?.message || error}`,
      folderPath,
      folderId,
      fileName,
    };
  }
}
