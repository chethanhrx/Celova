const { google } = require('googleapis');

/**
 * Creates an authenticated OAuth2 client for YouTube Data API v3
 * Uses pre-authorized refresh token stored in .env
 */
const getYouTubeClient = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });

  return google.youtube({
    version: 'v3',
    auth: oauth2Client,
  });
};

module.exports = { getYouTubeClient };
