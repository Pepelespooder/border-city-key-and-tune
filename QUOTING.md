# Instant quoting: setup and launch

The public form is a working vehicle enquiry tool. It prepares email, SMS and copyable requests; it does not send or store leads, book appointments, or process payments. Email/SMS delivery depends on the visitor's app and only happens when they send. There are no approved business rates in this repository, so production currently returns a request for review rather than a dollar amount.

## How to turn on estimates

Edit `quote-config.js`. All content here is public. Add only customer-facing rates, never purchase costs, credentials or private margins.

1. Confirm which vehicle/year/key combinations you can service.
2. Set `validUntil` to an ISO date (`YYYY-MM-DD`). Expired or missing dates disable estimates.
3. Add an enabled rule for each supported year range, exact make/model, service, key type and working-key situation.
4. Set each confirmed location charge in `travel` to a nonnegative number. `0` means included. `null` means service arrangements need review. Location alone does not promise mobile service.
5. Set the business's confirmed tax treatment. `null` explicitly leaves tax to be confirmed. Do not configure a tax rate until it applies to your business.
6. Test a supported and unsupported request before publishing rates.

Rule shape (replace placeholders with approved values; do not paste as executable JavaScript):

```text
{
  enabled: true,
  make: "EXACT MAKE",
  model: "EXACT MODEL",
  yearMin: FIRST_SUPPORTED_YEAR,
  yearMax: LAST_SUPPORTED_YEAR,
  service: "spare",
  keyType: "transponder",
  workingKeys: "yes",
  price: { min: APPROVED_MINIMUM_CAD, max: APPROVED_MAXIMUM_CAD },
  includes: "State exactly which key, cutting and programming are included"
}
```

Key services: `spare`, `lost`, `program`. Key types: `blade`, `transponder`, `remote`, `smart`. Working keys: `yes`, `no`. A spare requires a working key; all-keys-lost requires none. Use separate rules for distinct jobs. Exact make/model matching ignores case and outer spaces; it deliberately does not infer trims or aliases. Overlapping rules produce review rather than selecting an arbitrary price. ECU/PCM and tuning always receive individual review.

## Agree on the prices

For each vehicle group, work out:

| Item | Decision needed |
| --- | --- |
| Key / remote | Supplied by you or customer, quality, buttons and emergency blade |
| Cutting | Included, additional, or unavailable for that vehicle |
| Programming | Labour, access charges and any vehicle-specific procedure |
| All keys lost | Separate labour and parts allowance; do not just reuse spare-key pricing |
| Travel / handoff | Service method, covered locations and exact charge |
| Margin | Parts + cutting + programming/access costs + travel + labour + margin |
| Tax | Business's actual tax treatment; state whether included |

Use a narrow range only when the remaining variation is understood. If a vehicle can require a more expensive procedure, route it to review until the system can distinguish that procedure. A matching year/make/model is an initial pricing filter, not guaranteed hardware compatibility; confirm key identifiers and scope directly.

## Next stage

For confirmed instant prices rather than indicative estimates, add a verified vehicle/key catalogue and part identifiers, supported-procedure data, stock checks, service-radius calculation, and a server-side quote record with rate version and expiry. Build lead submission with consent, retention and spam controls before collecting personal information. Do not request VINs or ownership documents in the current static form. Confirm ownership/authorization and the service arrangement directly before key work.

## Verification

Run `node --test tests/quote-engine.test.cjs`. Tests use synthetic values, not proposed business rates. Browser checks should cover service deep links, field visibility, required inputs, edited requests invalidating the previous result, and email/SMS summary contents on desktop and mobile. There is no backend or external API dependency.
