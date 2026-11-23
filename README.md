# Border City Key & Tune website

A static multipage website for Border City Key & Tune. It uses plain HTML, CSS, and a small JavaScript file, so GitHub Pages can serve it directly from the repository root.

## Local preview

Open `index.html` in a browser, or run a local static server from this directory.

## GitHub Pages

In the repository's **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.

## Business details

The site lists car key services, ECU programming, PCM programming, vehicle tuning, phone 519-992-5092, and email DavidBlake@BorderCityKey.com. It also describes the independent Windsor-Essex business and its origin story. Update the HTML files if these details change.


## Design and quote flow

The homepage uses an editorial layout with direct service links, a job selector, the existing owner story, and FAQs. `quote.html` collects a vehicle enquiry locally and prepares email/SMS/copy handoffs. Rates are intentionally unconfigured until approved. See [QUOTING.md](QUOTING.md) for the pricing model, configuration and launch checklist.

Run quote logic checks with `node --test tests/quote-engine.test.cjs`.
