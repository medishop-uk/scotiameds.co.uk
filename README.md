# scotiameds.co.uk

Local preview: http://localhost/scotiameds.co.uk/

Deploy the folder contents, including `.htaccess` and `site-discovery.php`, to an Apache/PHP host with mod_rewrite enabled. Internal links are relative; redirects, `/sitemap.xml` and `/robots.txt` adapt to the current host and installation folder. The XML source retains production canonical URLs for deployment.

The seven category pages retain their supporting content below the category sidebar and medicine grid. Category definitions and membership are recorded in `tools/build-categories.js`. All medicine cards and product pages use the retained medicine-product.svg placeholder. Six ScotiaMeds banners are used; `homepage-slider-01.jpg` is excluded because its artwork says EnglandMeds.

Checks: `node tools/verify-categories.js`, `node tools/verify-category-render.js`, `node tools/verify-image-render.js`, and `node tools/verify-site-chrome.js` (the browser checks use installed Chrome).

ScotiaMeds is a dependable UK online pharmacy offering genuine prescription-only medicines with secure delivery across the nation. Our safe online ordering process makes it easier for patients throughout the United Kingdom to access the treatments they need while protecting their privacy at every step.

Headers are standardized by `node tools/refresh-site-chrome.js` (also called by `tools/update-navigation.js`). Apache serves no-store cache headers for pages and assets; asset version query strings have been removed. Basket localStorage is preserved.
