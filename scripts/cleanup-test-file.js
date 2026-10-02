import dotenv from 'dotenv';
dotenv.config();

import { OAuth2Client } from 'google-auth-library';

async function cleanupFile(fileId) {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });
  const token = (await oauth2Client.getAccessToken())?.token;

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`Deleted file ${fileId} from Drive: HTTP ${res.status}`);
}

const fileId = process.argv[2] || '1rlHLMGm0-pQyjJSVlr09VwJeg2ru9iUg';
cleanupFile(fileId);
