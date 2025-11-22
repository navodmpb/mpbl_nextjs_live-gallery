import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// Initialize Google Drive
function getDrive() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  return google.drive({ version: 'v3', auth });
}

export async function GET(request, { params }) {
  try {
    const fileId = params.fileId;
    const drive = getDrive();

    // Get file metadata first to get mimeType
    const fileMeta = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType',
    });

    // Get file content as arraybuffer
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    // Convert to Buffer
    const buffer = Buffer.from(response.data);

    // Return image with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': fileMeta.data.mimeType || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Failed to load image' },
      { status: 500 }
    );
  }
}