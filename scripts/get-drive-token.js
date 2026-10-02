import http from 'http';
import fs from 'fs';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

let clientId = '';
let clientSecret = '';

for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
  const eqIdx = trimmed.indexOf('=');
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  if (key === 'GOOGLE_DRIVE_CLIENT_ID') clientId = val.replace(/^["']|["']$/g, '');
  if (key === 'GOOGLE_DRIVE_CLIENT_SECRET') clientSecret = val.replace(/^["']|["']$/g, '');
}

if (!clientId || !clientSecret) {
  console.error('\n❌ Missing OAuth credentials in .env');
  console.error('Please add your GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET to .env first.\n');
  process.exit(1);
}

const PORT = 8085;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/oauth2callback`;

const oauth2Client = new OAuth2Client(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/drive.file'],
  prompt: 'consent', // Forces refresh_token return
});

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url || '', `http://127.0.0.1:${PORT}`);
    if (reqUrl.pathname === '/oauth2callback') {
      const code = reqUrl.searchParams.get('code');
      const error = reqUrl.searchParams.get('error');

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`<h2>Authorization Error</h2><p>${error}</p>`);
        console.error('Authorization rejected by user:', error);
        server.close();
        process.exit(1);
        return;
      }

      if (code) {
        const { tokens } = await oauth2Client.getToken(code);
        const refreshToken = tokens.refresh_token;

        if (refreshToken) {
          // Update .env safely without exposing secret
          let updatedEnv = fs.readFileSync(envPath, 'utf8');
          if (updatedEnv.includes('GOOGLE_DRIVE_REFRESH_TOKEN=')) {
            updatedEnv = updatedEnv.replace(
              /GOOGLE_DRIVE_REFRESH_TOKEN=.*/,
              `GOOGLE_DRIVE_REFRESH_TOKEN=${refreshToken}`
            );
          } else {
            updatedEnv += `\nGOOGLE_DRIVE_REFRESH_TOKEN=${refreshToken}\n`;
          }
          fs.writeFileSync(envPath, updatedEnv, 'utf8');

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #16a34a;">Authorization Successful!</h1>
                <p>Google Drive Refresh Token has been automatically saved to your .env file.</p>
                <p>You can close this tab and return to the terminal.</p>
              </body>
            </html>
          `);

          console.log('\n=============================================================');
          console.log('✅ Google Drive OAuth Authorization Successful!');
          console.log('✅ GOOGLE_DRIVE_REFRESH_TOKEN has been saved to .env.');
          console.log('=============================================================\n');

          setTimeout(() => {
            server.close();
            process.exit(0);
          }, 1000);
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<h2>No refresh token returned. Revoke previous access and re-run.</h2>');
          console.error('No refresh token received in response.');
          server.close();
          process.exit(1);
        }
      }
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error processing callback');
    console.error('OAuth callback error:', err?.message || err);
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n=============================================================');
  console.log('MOMENTPRESS: GOOGLE DRIVE OAUTH AUTHORIZATION');
  console.log('=============================================================');
  console.log('\nPlease open this URL in your browser to authorize MomentPress:');
  console.log(`\n${authUrl}\n`);
  console.log('Waiting for authorization callback on http://127.0.0.1:' + PORT + '...');
  console.log('=============================================================\n');
});
