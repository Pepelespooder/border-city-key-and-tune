(function (root) {
  'use strict';
  const keyServices = ['spare', 'lost', 'program'];
  const validRange = value => value && Number.isFinite(value.min) && Number.isFinite(value.max) && value.min >= 0 && value.max >= value.min;
  function calculateQuote(input, config, today = new Date().toISOString().slice(0, 10)) {
    const review = reason => ({ status: 'review', reason });
    if (!input || !config) return review('Please contact us to review this job.');
    if (input.service === 'diagnostics') return review('I’ll review the symptoms and confirm diagnostic coverage, the work involved and pricing for your vehicle.');
    if (!keyServices.includes(input.service)) return review('I’ll confirm vehicle compatibility, the work involved and pricing with you.');
    if ((input.service === 'spare' && input.workingKeys !== 'yes') || (input.service === 'lost' && input.workingKeys !== 'no') || input.workingKeys === 'unknown') return review('We need to confirm how many working keys remain before pricing this job.');
    if (input.keyType === 'unknown') return review('We’ll identify the key type before confirming a price.');
    const year = Number(input.vehicleYear);
    if (!Number.isInteger(year) || year < 1980 || year > new Date().getFullYear() + 1 || !input.make?.trim() || !input.model?.trim()) return review('Please confirm the vehicle year, make and model.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(config.validUntil || '') || config.validUntil < today) return review('Your vehicle details are ready for a price and compatibility check.');
    const normal = value => String(value || '').trim().toLowerCase();
    const matches = (config.rules || []).filter(rule => rule.enabled === true && rule.service === input.service && rule.keyType === input.keyType && rule.workingKeys === input.workingKeys && normal(rule.make) === normal(input.make) && normal(rule.model) === normal(input.model) && Number.isInteger(rule.yearMin) && Number.isInteger(rule.yearMax) && year >= rule.yearMin && year <= rule.yearMax);
    if (matches.length !== 1 || !validRange(matches[0]?.price)) return review('This vehicle and service need a price and compatibility check.');
    const travel = config.travel?.[input.location];
    if (!Number.isFinite(travel) || travel < 0) return review('We’ll confirm service arrangements and any travel charge for your location.');
    const rule = matches[0];
    if (!rule.includes?.trim()) return review('We’ll confirm what is included before pricing this job.');
    if (config.taxRate !== null && (!Number.isFinite(config.taxRate) || config.taxRate < 0 || config.taxRate > 1)) return review('Please contact us to confirm the total.');
    const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
    const subtotal = { min: round(rule.price.min + travel), max: round(rule.price.max + travel) };
    const tax = config.taxRate === null ? null : { min: round(subtotal.min * config.taxRate), max: round(subtotal.max * config.taxRate) };
    return { status: 'estimate', price: rule.price, travel, subtotal, tax, total: tax ? { min: round(subtotal.min + tax.min), max: round(subtotal.max + tax.max) } : subtotal, includes: rule.includes, validUntil: config.validUntil };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculateQuote };
  else root.calculateQuote = calculateQuote;
})(typeof window !== 'undefined' ? window : globalThis);
