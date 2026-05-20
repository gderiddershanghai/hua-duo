/**
 * Upload router — classifies input as image or text and sends
 * to the appropriate server endpoint for LLM parsing.
 *
 * Image → POST /api/parse/image  (multipart, uses OCR prompt)
 * Text  → POST /api/parse/text   (JSON body, uses NL prompt)
 *
 * Both return structured JSON events for the confirmation screen.
 */

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const API_BASE = '';  // same origin; change for dev proxy

/**
 * Route an upload to the correct parsing endpoint.
 * @param {File|string} input – a File (image) or string (natural language)
 * @returns {Promise<Object>} parsed event JSON from the LLM
 */
export async function routeUpload(input) {
  if (typeof input === 'string') {
    return parseText(input);
  }
  if (input instanceof File && IMAGE_TYPES.includes(input.type)) {
    return parseImage(input);
  }
  throw new Error(`Unsupported input: expected image file or text string`);
}

async function parseImage(file) {
  const form = new FormData();
  form.append('image', file);

  const res = await fetch(`${API_BASE}/api/parse/image`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Image parse failed: ${res.status}`);
  return res.json();
}

async function parseText(text) {
  const res = await fetch(`${API_BASE}/api/parse/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Text parse failed: ${res.status}`);
  return res.json();
}
