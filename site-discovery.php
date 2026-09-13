<?php
// Serve the same sitemap from a local subdirectory or the deployed domain root.
$https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
if (!preg_match('/\A[a-z0-9.\-\[\]:]+\z/i', $host)) {
    http_response_code(400);
    exit;
}
$directory = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/.');
$base = ($https ? 'https://' : 'http://') . $host . $directory;
if (($_GET['type'] ?? '') === 'robots') {
    header('Content-Type: text/plain; charset=UTF-8');
    echo "User-agent: *\nAllow: /\nDisallow: " . $directory . "/google-apps-script/\n\nSitemap: " . $base . "/sitemap.xml\n";
    exit;
}
header('Content-Type: application/xml; charset=UTF-8');
echo str_replace('https://www.scotiameds.co.uk', htmlspecialchars($base, ENT_XML1 | ENT_QUOTES, 'UTF-8'), file_get_contents(__DIR__ . '/sitemap.xml'));
