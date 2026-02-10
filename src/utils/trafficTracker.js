/**
 * Traffic tracking utility
 * Sends visitor information to the backend server for logging
 */

const TRACKING_ENDPOINT = 'http://localhost:3001/api/track';
let hasTracked = false;

/**
 * Track a page visit
 * @param {string} page - The page/route being visited
 */
export async function trackVisit(page = 'Unknown') {
  // Only track once per session to avoid spam
  if (hasTracked) {
    return;
  }

  try {
    const response = await fetch(TRACKING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: page,
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      hasTracked = true;
      console.log('Traffic tracked successfully');
    }
  } catch (error) {
    // Silently fail - don't interrupt user experience
    console.warn('Traffic tracking failed (server may not be running):', error.message);
  }
}

/**
 * Reset tracking flag (useful for testing)
 */
export function resetTracking() {
  hasTracked = false;
}

