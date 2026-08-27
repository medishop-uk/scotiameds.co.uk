<?php
declare(strict_types=1);

$root = __DIR__;
$apply = in_array('--apply', $argv, true);
$files = [];
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));
foreach ($iterator as $file) {
    if ($file->isFile() && strtolower($file->getExtension()) === 'html') {
        $files[] = $file->getPathname();
    }
}
sort($files);

function plainText(string $html): string {
    $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    return trim((string)preg_replace('/\s+/u', ' ', $text));
}

function neutralText(string $text): string {
    $text = preg_replace('/\bordering\b/iu', 'requesting', $text);
    $text = preg_replace('/\borders\b/iu', 'requests', (string)$text);
    $text = preg_replace('/\bordered\b/iu', 'requested', (string)$text);
    $text = preg_replace('/\border\b/iu', 'request', (string)$text);
    $text = preg_replace('/EnglandsmedsUK|England\s*Meds(?:\s*UK)?/iu', 'ScotiaMeds', (string)$text);
    $text = preg_replace('/Scotia\s+Meds/iu', 'ScotiaMeds', (string)$text);
    return trim((string)preg_replace('/\s+/u', ' ', (string)$text));
}

function truncateWords(string $text, int $limit): string {
    if (mb_strlen($text) <= $limit) return $text;
    $cut = mb_substr($text, 0, $limit + 1);
    $space = mb_strrpos($cut, ' ');
    if ($space !== false) $cut = mb_substr($cut, 0, $space);
    return rtrim($cut, " ,.;:-") . '…';
}

function paragraphFields(string $html): array {
    $fields = [];
    if (!preg_match_all('~<p\b[^>]*>(.*?)</p>~isu', $html, $matches)) return $fields;
    foreach ($matches[1] as $inside) {
        $text = plainText($inside);
        foreach (['Meta Title', 'Meta Description', 'Title'] as $label) {
            if (preg_match('/^' . preg_quote($label, '/') . '\s*:\s*(.+)$/iu', $text, $match)) {
                $fields[$label] = neutralText($match[1]);
            }
        }
    }
    return $fields;
}

function mainHeading(string $html): array {
    if (!preg_match_all('~<h1\b[^>]*>(.*?)</h1>~isu', $html, $matches, PREG_OFFSET_CAPTURE)) return ['', 0];
    foreach ($matches[1] as $index => $match) {
        $text = neutralText(plainText($match[0]));
        if ($text !== '' && !preg_match('/^=+$/', $text)) {
            return [$text, $matches[0][$index][1] + strlen($matches[0][$index][0])];
        }
    }
    return ['', 0];
}

function firstLead(string $html, int $after): string {
    $tail = substr($html, $after);
    if (!preg_match_all('~<p\b[^>]*>(.*?)</p>~isu', $tail, $matches)) return '';
    foreach ($matches[1] as $inside) {
        $text = neutralText(plainText($inside));
        if ($text === '' || preg_match('/^(?:Meta |Title:|Type:|Tag:|URL:|Page Name:|=+)/iu', $text)) continue;
        return $text;
    }
    return '';
}

function canonicalUrl(string $html, string $relative): string {
    if (preg_match('~<link\b[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)~iu', $html, $match)) return $match[1];
    if (preg_match('~<link\b[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']canonical["\']~iu', $html, $match)) return $match[1];
    $path = str_replace('\\', '/', preg_replace('/(?:\/index)?\.html$/i', '', $relative));
    return 'https://www.scotiameds.co.uk/' . ltrim($path, '/');
}

function breadcrumbData(string $canonical, string $heading): array {
    $items = [['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => 'https://www.scotiameds.co.uk/']];
    $path = trim((string)parse_url($canonical, PHP_URL_PATH), '/');
    if ($path === '') return $items;
    $parts = explode('/', $path);
    $url = 'https://www.scotiameds.co.uk';
    foreach ($parts as $index => $part) {
        $url .= '/' . $part;
        $name = $index === count($parts) - 1 ? $heading : ucwords(str_replace(['-', 'medicine'], [' ', 'Medicines'], $part));
        $items[] = ['@type' => 'ListItem', 'position' => count($items) + 1, 'name' => $name, 'item' => $url];
    }
    return $items;
}

$report = [];
foreach ($files as $path) {
    $relative = ltrim(str_replace($root, '', $path), '\\/');
    $html = file_get_contents($path);
    if ($html === false) continue;
    $original = $html;
    $fields = paragraphFields($html);
    [$heading, $headingEnd] = mainHeading($html);
    $lead = firstLead($html, $headingEnd);
    $canonical = canonicalUrl($html, $relative);

    if (preg_match('~<title\b[^>]*>(.*?)</title>~isu', $html, $match)) {
        $title = neutralText(plainText($match[1]));
    } else {
        $title = $fields['Meta Title'] ?? $fields['Title'] ?? $heading;
    }
    if ($title === '') $title = 'ScotiaMeds';
    $title = preg_replace('/\s+in the United Kingdom/iu', ' in the UK', $title);
    if (!preg_match('/ScotiaMeds/iu', $title)) $title .= ' | ScotiaMeds';
    $title = truncateWords(neutralText($title), 75);

    if (preg_match('~<meta\b(?=[^>]*name=["\']description["\'])[^>]*content=["\']([^"\']*)["\'][^>]*>~isu', $html, $match)) {
        $description = neutralText(html_entity_decode($match[1], ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    } else {
        $description = $fields['Meta Description'] ?? $lead;
    }
    if (mb_strlen($description) < 70 && mb_strlen($lead) > mb_strlen($description)) $description = $lead;
    if ($description === '') $description = 'Explore clear medicine information, treatment guidance and private UK-wide support from ScotiaMeds.';
    $description = truncateWords(neutralText($description), 170);

    $html = preg_replace('/<html(?![^>]*\blang=)([^>]*)>/iu', '<html lang="en-GB"$1>', $html, 1);
    $titleTag = '<title>' . htmlspecialchars($title, ENT_QUOTES | ENT_HTML5, 'UTF-8') . '</title>';
    if (preg_match('~<title\b[^>]*>.*?</title>~isu', $html)) $html = preg_replace('~<title\b[^>]*>.*?</title>~isu', $titleTag, $html, 1);
    else $html = preg_replace('~<head\b[^>]*>~iu', '$0' . $titleTag, $html, 1);

    $descriptionTag = '<meta name="description" content="' . htmlspecialchars($description, ENT_QUOTES | ENT_HTML5, 'UTF-8') . '">';
    if (preg_match('~<meta\b(?=[^>]*name=["\']description["\'])[^>]*>~isu', $html)) $html = preg_replace('~<meta\b(?=[^>]*name=["\']description["\'])[^>]*>~isu', $descriptionTag, $html, 1);
    else $html = preg_replace('~</title>~iu', '</title>' . $descriptionTag, $html, 1);

    if (!preg_match('~<meta\b(?=[^>]*name=["\']robots["\'])[^>]*>~iu', $html)) {
        $html = preg_replace('~</title>~iu', '</title><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">', $html, 1);
    }
    if (!preg_match('~property=["\']og:title["\']~iu', $html)) {
        $social = '<meta property="og:type" content="website">'
            . '<meta property="og:site_name" content="ScotiaMeds">'
            . '<meta property="og:title" content="' . htmlspecialchars($title, ENT_QUOTES | ENT_HTML5, 'UTF-8') . '">'
            . '<meta property="og:description" content="' . htmlspecialchars($description, ENT_QUOTES | ENT_HTML5, 'UTF-8') . '">'
            . '<meta property="og:url" content="' . htmlspecialchars($canonical, ENT_QUOTES | ENT_HTML5, 'UTF-8') . '">'
            . '<meta name="twitter:card" content="summary">';
        $html = preg_replace('~</title>~iu', '</title>' . $social, $html, 1);
    }

    if (!preg_match('~application/ld\+json~iu', $html)) {
        if ($relative === 'index.html') {
            $schema = [
                '@context' => 'https://schema.org',
                '@graph' => [
                    ['@type' => 'WebSite', '@id' => 'https://www.scotiameds.co.uk/#website', 'url' => 'https://www.scotiameds.co.uk/', 'name' => 'ScotiaMeds'],
                    ['@type' => 'Organization', '@id' => 'https://www.scotiameds.co.uk/#organization', 'name' => 'ScotiaMeds', 'url' => 'https://www.scotiameds.co.uk/', 'logo' => 'https://www.scotiameds.co.uk/assets/img/logo.svg']
                ]
            ];
        } else {
            $schema = ['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => breadcrumbData($canonical, $heading ?: $title)];
        }
        $json = json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $html = preg_replace('~</head>~iu', '<script type="application/ld+json">' . $json . '</script></head>', $html, 1);
    }

    $html = preg_replace_callback('~<(p|h1)\b[^>]*>.*?</\1>~isu', static function(array $match): string {
        $text = plainText($match[0]);
        if ($text === '' || preg_match('/^(?:Meta Title|Meta Description|Title|Type|Tag|URL|Page Name)\s*:/iu', $text) || preg_match('/^=+$/', $text)) return '';
        return $match[0];
    }, $html);

    $html = preg_replace_callback('~<span\b(?=[^>]*font-weight\s*:\s*700)[^>]*>(.*?)</span>~isu', static fn(array $m): string => '<strong>' . $m[1] . '</strong>', $html);
    $html = preg_replace_callback('~href=(["\'])https?://www\.google\.com/url\?q=([^&"\']+)[^"\']*\1~iu', static function(array $m): string {
        return 'href=' . $m[1] . htmlspecialchars(urldecode($m[2]), ENT_QUOTES | ENT_HTML5, 'UTF-8') . $m[1];
    }, $html);
    $html = preg_replace('~<style\b[^>]*>.*?</style>~isu', '', $html);
    $html = preg_replace('/\sstyle=(["\']).*?\1/isu', '', $html);

    if ($html !== $original && $apply) file_put_contents($path, $html);
    $report[] = ['file' => $relative, 'title' => $title, 'description' => $description, 'changed' => $html !== $original];
}

echo json_encode(['mode' => $apply ? 'apply' : 'dry-run', 'pages' => count($report), 'changed' => count(array_filter($report, static fn($r) => $r['changed'])), 'items' => $report], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
