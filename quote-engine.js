(function (root) {
  'use strict';
  const keyServices = ['spare', 'lost', 'program'];
  const validRange = value => value && Number.isFinite(value.min) && Number.isFinite(value.max) && value.min >= 0 && value.max >= value.min;
  function calculateQuote(input, config, today = new Date().toISOString().slice(0, 10)) {
    const review = reason => ({ status: 'review', reason });
    if (!input || !config) return review('Please get in touch so I can review the job.');
    if (input.service === 'diagnostics') return review('I’ll review the symptoms, check diagnostic coverage for your vehicle, and discuss the work and cost with you.');
    if (!keyServices.includes(input.service)) return review('I’ll check compatibility and discuss the work and price with you.');
    if ((input.service === 'spare' && input.workingKeys !== 'yes') || (input.service === 'lost' && input.workingKeys !== 'no') || input.workingKeys === 'unknown') return review('I’ll need to confirm whether you have a working key before quoting for this job.');
    if (input.keyType === 'unknown') return review('I’ll help identify the key type before confirming a price.');
    const year = Number(input.vehicleYear);
    if (!Number.isInteger(year) || year < 1980 || year > new Date().getFullYear() + 1 || !input.make?.trim() || !input.model?.trim()) return review('Please confirm the vehicle year, make and model.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(config.validUntil || '') || config.validUntil < today) return review('Your details are ready to send for a quote.');
    const normal = value => String(value || '').trim().toLowerCase();
    const matches = (config.rules || []).filter(rule => rule.enabled === true && rule.service === input.service && rule.keyType === input.keyType && rule.workingKeys === input.workingKeys && normal(rule.make) === normal(input.make) && normal(rule.model) === normal(input.model) && Number.isInteger(rule.yearMin) && Number.isInteger(rule.yearMax) && year >= rule.yearMin && year <= rule.yearMax);
    if (matches.length !== 1 || !validRange(matches[0]?.price)) return review('I’ll check the options for your vehicle and confirm a price.');
    const travel = config.travel?.[input.location];
    if (!Number.isFinite(travel) || travel < 0) return review('I’ll confirm arrangements for your location and any travel charge.');
    const rule = matches[0];
    if (!rule.includes?.trim()) return review('I’ll confirm what the job includes before providing a price.');
    if (config.taxRate !== null && (!Number.isFinite(config.taxRate) || config.taxRate < 0 || config.taxRate > 1)) return review('Please get in touch to confirm the total.');
    const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
    const subtotal = { min: round(rule.price.min + travel), max: round(rule.price.max + travel) };
    const tax = config.taxRate === null ? null : { min: round(subtotal.min * config.taxRate), max: round(subtotal.max * config.taxRate) };
    return { status: 'estimate', price: rule.price, travel, subtotal, tax, total: tax ? { min: round(subtotal.min + tax.min), max: round(subtotal.max + tax.max) } : subtotal, includes: rule.includes, validUntil: config.validUntil };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculateQuote };
  else root.calculateQuote = calculateQuote;
})(typeof window !== 'undefined' ? window : globalThis);
