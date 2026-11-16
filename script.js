'use strict';
const yearLabel = document.getElementById('year');
if (yearLabel) yearLabel.textContent = new Date().getFullYear();
const form = document.getElementById('quote-form');
if (form) {
  const service = form.elements.service;
  const keyFields = document.getElementById('key-fields');
  const partField = document.getElementById('part-field');
  const result = document.getElementById('quote-result');
  const initialResult = result.innerHTML;
  const yearInput = document.getElementById('vehicle-year');
  yearInput.max = new Date().getFullYear() + 1;
  const labels = {
    service: { spare: 'Spare / additional key', lost: 'All keys lost', program: 'Program customer-supplied key', diagnostics: 'Dealership-level diagnostics', module: 'ECU / PCM programming', tuning: 'Vehicle tuning' },
    keyType: { unknown: 'Not sure', blade: 'Basic metal key', transponder: 'Chipped ignition key', remote: 'Remote-head ignition key', smart: 'Push-button / smart key' },
    workingKeys: { unknown: 'Not sure', yes: 'At least one', no: 'None' },
    location: { windsor: 'Windsor', lasalle: 'LaSalle', tecumseh: 'Tecumseh', other: 'Elsewhere / discuss' }
  };
  const keyService = () => ['spare', 'lost', 'program'].includes(service.value);
  function syncFields() {
    keyFields.hidden = !keyService();
    for (const input of keyFields.querySelectorAll('select')) input.disabled = !keyService();
    partField.hidden = service.value !== 'module';
    form.elements.part.disabled = partField.hidden;
  }
  const prefill = new URLSearchParams(location.search).get('service');
  if (Object.hasOwn(labels.service, prefill)) service.value = prefill;
  syncFields();
  function invalidate() {
    result.innerHTML = initialResult;
    const note = document.createElement('p');
    note.className = 'stale-note';
    note.textContent = 'Review your current details below to update the quote request.';
    result.append(note);
  }
  form.addEventListener('input', invalidate);
  form.addEventListener('change', () => { syncFields(); invalidate(); });
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  const money = value => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 2 }).format(value);
  const range = value => value.min === value.max ? money(value.min) : `${money(value.min)}–${money(value.max)}`;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    const quote = window.calculateQuote(data, window.QUOTE_CONFIG);
    result.replaceChildren(element('span', 'YOUR QUOTE REQUEST', 'form-kicker'));
    const estimated = quote.status === 'estimate';
    result.append(element('h2', estimated ? 'Your estimated price.' : 'Let’s confirm the details.'));
    if (estimated) {
      result.append(element('p', `${range(quote.total)} CAD`, 'estimate-amount'));
      const lines = element('div', undefined, 'price-lines');
      for (const [title, amount] of [['Service', range(quote.price)], ['Travel / service arrangement', money(quote.travel)], ['Tax', quote.tax ? range(quote.tax) : 'To be confirmed']]) {
        const row = element('p'); row.append(element('span', title), element('strong', amount)); lines.append(row);
      }
      result.append(lines, element('p', `Includes: ${quote.includes}`), element('p', `Rates valid through ${quote.validUntil}. ${quote.tax ? 'Includes configured tax.' : 'Tax is not included; confirm tax treatment directly.'}`));
    } else result.append(element('p', quote.reason), element('p', 'No automatic price is available for this request. Send these details and we’ll review the job with you.'));
    const rows = [ ['Vehicle', `${data.vehicleYear} ${data.make.trim()} ${data.model.trim()}`], ['Service', labels.service[data.service]], ['Location', labels.location[data.location]] ];
    if (keyService()) rows.push(['Key type', labels.keyType[data.keyType]], ['Working keys', labels.workingKeys[data.workingKeys]]);
    if (data.part?.trim()) rows.push(['Module', data.part.trim()]);
    if (data.notes?.trim()) rows.push(['Notes', data.notes.trim()]);
    const summary = element('dl', undefined, 'quote-summary');
    for (const [label, value] of rows) { const row = element('div'); row.append(element('dt', label), element('dd', value)); summary.append(row); }
    result.append(summary);
    const priceText = estimated ? `Indicative estimate: ${range(quote.total)} CAD. ${quote.tax ? 'Configured tax included.' : 'Tax to be confirmed; not included.'}\nIncludes: ${quote.includes}\nRate valid through: ${quote.validUntil}` : 'Price: individual review requested (no automatic price).';
    const message = `Hello Border City Key & Tune,\n\n${rows.map(([label, value]) => `${label}: ${value}`).join('\n')}\n\n${priceText}\n\nPlease confirm compatibility, the final total and service arrangements.`;
    const email = element('a', 'Open email with these details →', 'button button-primary');
    email.href = `mailto:Makina2445@outlook.com?subject=${encodeURIComponent('Vehicle quote request — ' + rows[0][1])}&body=${encodeURIComponent(message)}`;
    const sms = element('a', 'Open text message →', 'button secondary-action');
    sms.href = `sms:+15199925092?body=${encodeURIComponent(message)}`;
    const copy = element('button', 'Copy quote request', 'button secondary-action'); copy.type = 'button';
    const status = element('p', '', 'copy-status'); status.setAttribute('role', 'status');
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(message); status.textContent = 'Copied. Paste it into your email or messaging app.'; }
      catch { status.textContent = 'Copy is unavailable here. Select the request text below to copy it manually.'; const text = element('textarea'); text.readOnly = true; text.value = message; text.setAttribute('aria-label', 'Quote request to copy'); result.append(text); text.focus(); text.select(); }
    });
    result.append(email, sms, copy, status, element('p', 'Nothing has been sent. Email and text open your own app; review and send there. This is an enquiry, not a booking. Compatibility and the final total must be confirmed before work begins.', 'small-note'));
    result.focus();
  });
}
