/* Public customer-facing rates only. Never put private costs or credentials here.
 * Add approved, vehicle-specific rules as described in QUOTING.md.
 * Empty rules deliberately produce a review request, never an invented price.
 */
(function (root) {
  const config = {
    currency: 'CAD',
    validUntil: null,
    rules: [],
    travel: { windsor: null, lasalle: null, tecumseh: null },
    // Set a confirmed tax rate (e.g. 0.13) only when appropriate for the business.
    taxRate: null
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = config;
  else root.QUOTE_CONFIG = config;
})(typeof window !== 'undefined' ? window : globalThis);
