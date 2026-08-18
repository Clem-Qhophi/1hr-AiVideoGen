"""Web search — fetches current information about a topic before script writing.

Uses DuckDuckGo's HTML search (no API key needed) to get fresh results, then
fetches the top results' content for context. This ensures scripts are based
on CURRENT information, not stale LLM training data.
"""
import re
import requests
from html.parser import HTMLParser
from urllib.parse import quote_plus


class _TextExtractor(HTMLParser):
    """Simple HTML to text extractor."""
    def __init__(self):
        super().__init__()
        self.text = []
        self._skip = False

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'nav', 'footer', 'header', 'aside'):
            self._skip = True

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'nav', 'footer', 'header', 'aside'):
            self._skip = False

    def handle_data(self, data):
        if not self._skip:
            self.text.append(data)

    def get_text(self):
        return ' '.join(self.text)


def search_web(query: str, max_results: int = 5) -> list[dict]:
    """Search the web using DuckDuckGo HTML endpoint. Returns list of {title, url, snippet}."""
    url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

    try:
        r = requests.get(url, headers=headers, timeout=15)
        r.raise_for_status()
    except Exception as e:
        print(f"  search failed: {e}")
        return []

    results = []
    # Parse results from DuckDuckGo HTML
    result_blocks = re.findall(r'<div class="result__body">(.*?)</div>', r.text, re.DOTALL)
    for block in result_blocks[:max_results]:
        title_match = re.search(r'<a[^>]*class="result__a"[^>]*>(.*?)</a>', block, re.DOTALL)
        url_match = re.search(r'<a[^>]*class="result__a"[^>]*href="(.*?)"', block)
        snippet_match = re.search(r'<a[^>]*class="result__snippet"[^>]*>(.*?)</a>', block, re.DOTALL)

        title = re.sub(r'<[^>]+>', '', title_match.group(1)).strip() if title_match else ""
        link = url_match.group(1) if url_match else ""
        # DuckDuckGo redirects — extract actual URL
        if "uddg=" in link:
            from urllib.parse import parse_qs, urlparse
            parsed = urlparse(link)
            qs = parse_qs(parsed.query)
            link = qs.get("uddg", [link])[0]
        snippet = re.sub(r'<[^>]+>', '', snippet_match.group(1)).strip() if snippet_match else ""

        if title and link:
            results.append({"title": title, "url": link, "snippet": snippet})

    return results


def fetch_page_text(url: str, max_chars: int = 3000) -> str:
    """Fetch a URL and extract its main text content."""
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    try:
        r = requests.get(url, headers=headers, timeout=15, allow_redirects=True)
        r.raise_for_status()
        extractor = _TextExtractor()
        extractor.feed(r.text)
        text = extractor.get_text()
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        if len(text) > max_chars:
            text = text[:max_chars] + "..."
        return text
    except Exception as e:
        print(f"  page fetch failed for {url}: {e}")
        return ""


def research_topic(topic: str, max_results: int = 5) -> dict:
    """Search the web for a topic and fetch content from top results.

    Returns:
        {
            "query": str,
            "results": [{title, url, snippet, content}],
            "summary": str,  # combined context for the LLM
        }
    """
    print(f"  searching: {topic}")
    results = search_web(topic, max_results)

    # Fetch content from top 3 results
    for r in results[:3]:
        print(f"  fetching: {r['url'][:60]}...")
        content = fetch_page_text(r["url"])
        r["content"] = content

    # Build a summary for the LLM
    context_parts = []
    for r in results[:3]:
        if r.get("content"):
            context_parts.append(f"Source: {r['title']} ({r['url']})\n{r['content'][:1500]}")
        elif r.get("snippet"):
            context_parts.append(f"Source: {r['title']} ({r['url']})\n{r['snippet']}")

    summary = "\n\n---\n\n".join(context_parts) if context_parts else "No web results found."

    return {
        "query": topic,
        "results": results,
        "summary": summary,
    }


def find_evidence_urls(topic: str, script: str) -> list[str]:
    """Analyze the script and find URLs that should be screenshotted for evidence.

    Looks for:
    - Product/company names → search for their website
    - Direct URLs mentioned in the script
    - News sources referenced
    """
    evidence_urls = []

    # Find direct URLs in the script
    urls = re.findall(r'https?://[^\s<>"\']+', script)
    evidence_urls.extend(urls[:3])

    # Find company/product names and search for their websites
    # Look for patterns like "Company Name" or "product.com"
    domains = re.findall(r'(\w+\.(?:com|ai|io|org|net|dev))', script, re.IGNORECASE)
    for d in domains[:3]:
        evidence_urls.append(f"https://{d.lower()}")

    # Search for the main topic to find a relevant page
    if not evidence_urls:
        results = search_web(topic, max_results=3)
        for r in results[:2]:
            if r.get("url"):
                evidence_urls.append(r["url"])

    return evidence_urls[:5]  # max 5 evidence shots
