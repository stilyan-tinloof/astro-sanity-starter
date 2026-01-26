/**
 * Create a JSON response with consistent formatting.
 */
export function jsonResponse<T extends Record<string, unknown>>(
  data: T,
  status = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create an error response.
 */
export function errorResponse(error: string, status = 400): Response {
  return jsonResponse({ success: false, error }, status);
}

/**
 * Create a success response.
 */
export function successResponse<T extends Record<string, unknown>>(
  data: T
): Response {
  return jsonResponse({ success: true, ...data });
}
