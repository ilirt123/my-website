const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVIEWS_BASE_URL = 'https://mybusiness.googleapis.com/v4';
const CACHE_TTL_MS = 15 * 60 * 1000;

// Configure these in Vercel -> Project -> Settings -> Environment Variables.
// Use OAuth credentials for the verified All American Tiles Google Business Profile.
let cachedResponse = null;
let cachedAt = 0;

const requiredEnv = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN',
  'GOOGLE_BUSINESS_ACCOUNT_ID',
  'GOOGLE_BUSINESS_LOCATION_ID',
];

const starRatingMap = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

const getMissingEnv = () => requiredEnv.filter((name) => !process.env[name]);

const getAccessToken = async () => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Google OAuth token refresh failed: ${details}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error('Google OAuth token refresh did not return an access token.');
  }

  return data.access_token;
};

const normalizeReview = (review) => ({
  id: review.reviewId || review.name,
  reviewerName: review.reviewer?.displayName || 'Google reviewer',
  reviewerPhoto: review.reviewer?.profilePhotoUrl || '',
  starRating: starRatingMap[review.starRating] || 0,
  comment: review.comment || '',
  createTime: review.createTime || '',
  updateTime: review.updateTime || '',
});

const fetchAllReviews = async (accessToken) => {
  const accountId = encodeURIComponent(process.env.GOOGLE_BUSINESS_ACCOUNT_ID);
  const locationId = encodeURIComponent(process.env.GOOGLE_BUSINESS_LOCATION_ID);
  const reviews = [];
  let nextPageToken = '';
  let averageRating = null;
  let totalReviewCount = null;

  do {
    const url = new URL(`${GOOGLE_REVIEWS_BASE_URL}/accounts/${accountId}/locations/${locationId}/reviews`);
    url.searchParams.set('pageSize', '50');
    url.searchParams.set('orderBy', 'updateTime desc');
    if (nextPageToken) {
      url.searchParams.set('pageToken', nextPageToken);
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Google Business Profile reviews request failed: ${details}`);
    }

    const data = await response.json();
    reviews.push(...(data.reviews || []));
    nextPageToken = data.nextPageToken || '';
    averageRating = data.averageRating ?? averageRating;
    totalReviewCount = data.totalReviewCount ?? totalReviewCount;
  } while (nextPageToken);

  return {
    ok: true,
    source: 'google-business-profile',
    averageRating,
    totalReviewCount: totalReviewCount ?? reviews.length,
    reviews: reviews
      .map(normalizeReview)
      .filter((review) => review.starRating > 0 && review.comment),
    cachedAt: new Date().toISOString(),
  };
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');

  const missingEnvironmentVariables = getMissingEnv();
  if (missingEnvironmentVariables.length) {
    return res.status(500).json({
      error: 'Google Business Profile reviews are not configured.',
      missingEnvironmentVariables,
      requiredInVercel: requiredEnv,
      instructions: 'Add these in Vercel -> Project -> Settings -> Environment Variables. Use the verified All American Tiles Google Business Profile account and location IDs.',
    });
  }

  if (cachedResponse && Date.now() - cachedAt < CACHE_TTL_MS) {
    return res.status(200).json({ ...cachedResponse, cache: 'memory-hit' });
  }

  try {
    const accessToken = await getAccessToken();
    cachedResponse = await fetchAllReviews(accessToken);
    cachedAt = Date.now();
    return res.status(200).json({ ...cachedResponse, cache: 'fresh' });
  } catch (error) {
    return res.status(502).json({
      error: 'Unable to load Google Business Profile reviews.',
      detail: error.message,
    });
  }
};
