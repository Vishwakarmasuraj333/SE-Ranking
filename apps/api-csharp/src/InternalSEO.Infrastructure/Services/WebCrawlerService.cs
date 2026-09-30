using System.Diagnostics;
using System.Net;
using AngleSharp.Html.Parser;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace InternalSEO.Infrastructure.Services;

public class WebCrawlerService : IWebCrawlerService
{
    private const int MaxResponseSizeBytes = 2 * 1024 * 1024; // 2 MB
    private const int RequestTimeoutSeconds = 10;

    private readonly ISsrfValidator _ssrfValidator;
    private readonly IUrlNormalizer _urlNormalizer;
    private readonly ILogger<WebCrawlerService> _logger;
    private readonly HtmlParser _htmlParser;

    public WebCrawlerService(
        ISsrfValidator ssrfValidator,
        IUrlNormalizer urlNormalizer,
        ILogger<WebCrawlerService> logger)
    {
        _ssrfValidator = ssrfValidator;
        _urlNormalizer = urlNormalizer;
        _logger = logger;
        _htmlParser = new HtmlParser();
    }

    public async Task<List<CrawlPageResult>> CrawlWebsiteAsync(
        Uri startUrl,
        string primaryDomain,
        int maxPages,
        int maxDepth,
        int rateLimitMs,
        string userAgent,
        Func<int, int, Task>? onProgressAsync = null,
        CancellationToken cancellationToken = default)
    {
        var results = new List<CrawlPageResult>();
        var visitedUrls = new HashSet<String>(StringComparer.OrdinalIgnoreCase);
        var discoveredUrls = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var inlinksCount = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        var queue = new Queue<(Uri Uri, string NormalizedUrl, int Depth)>();

        // 1. Validate starting URL safety
        var (isSafe, reason) = await _ssrfValidator.ValidateUrlAsync(startUrl, primaryDomain, cancellationToken);
        if (!isSafe)
        {
            _logger.LogWarning("Start URL '{StartUrl}' rejected by SSRF validator: {Reason}", startUrl, reason);
            throw new CrawlValidationException($"Start URL '{startUrl}' rejected by security validator: {reason}");
        }

        var normalizedStart = _urlNormalizer.Normalize(startUrl);
        discoveredUrls.Add(normalizedStart);
        queue.Enqueue((startUrl, normalizedStart, 0));

        // Create HttpClient with redirects disabled to inspect redirect hops
        using var handler = new SocketsHttpHandler
        {
            AllowAutoRedirect = false,
            ConnectTimeout = TimeSpan.FromSeconds(RequestTimeoutSeconds),
            PooledConnectionLifetime = TimeSpan.FromMinutes(2)
        };

        using var httpClient = new HttpClient(handler);
        httpClient.Timeout = TimeSpan.FromSeconds(RequestTimeoutSeconds + 2);
        var agent = string.IsNullOrWhiteSpace(userAgent) ? "InternalSEOPlatformBot/1.0" : userAgent;
        httpClient.DefaultRequestHeaders.UserAgent.ParseAdd(agent);

        bool isFirstRequest = true;

        while (queue.Count > 0 && results.Count < maxPages && !cancellationToken.IsCancellationRequested)
        {
            var (currentUri, normalizedUrl, depth) = queue.Dequeue();

            if (visitedUrls.Contains(normalizedUrl))
            {
                continue;
            }

            visitedUrls.Add(normalizedUrl);

            // Respect rate limiting between requests
            if (!isFirstRequest && rateLimitMs > 0)
            {
                await Task.Delay(rateLimitMs, cancellationToken);
            }
            isFirstRequest = false;

            var pageResult = new CrawlPageResult
            {
                Url = normalizedUrl,
                UrlHash = _urlNormalizer.ComputeSha256Hash(normalizedUrl),
                CrawlDepth = depth
            };

            var stopwatch = Stopwatch.StartNew();

            try
            {
                // Double check SSRF before physical fetch in case of DNS rebinding
                var (currentSafe, currentReason) = await _ssrfValidator.ValidateUrlAsync(currentUri, primaryDomain, cancellationToken);
                if (!currentSafe)
                {
                    _logger.LogWarning("Skipping '{Url}' due to SSRF validation failure: {Reason}", currentUri, currentReason);
                    continue;
                }

                using var requestCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                requestCts.CancelAfter(TimeSpan.FromSeconds(RequestTimeoutSeconds));

                using var response = await httpClient.GetAsync(currentUri, HttpCompletionOption.ResponseHeadersRead, requestCts.Token);
                stopwatch.Stop();
                pageResult.LoadTimeMs = (int)stopwatch.ElapsedMilliseconds;
                pageResult.HttpStatusCode = (int)response.StatusCode;
                pageResult.ContentType = response.Content.Headers.ContentType?.MediaType;

                // Handle Redirects (3xx)
                if ((int)response.StatusCode >= 300 && (int)response.StatusCode < 400)
                {
                    pageResult.IsIndexable = false;
                    pageResult.IndexabilityStatus = "Redirect";

                    var locationHeader = response.Headers.Location?.ToString();
                    if (!string.IsNullOrWhiteSpace(locationHeader))
                    {
                        var targetNormalized = _urlNormalizer.Normalize(locationHeader, currentUri);
                        if (!string.IsNullOrEmpty(targetNormalized) && Uri.TryCreate(targetNormalized, UriKind.Absolute, out var targetUri))
                        {
                            if (_ssrfValidator.IsWithinDomainBoundary(targetUri, primaryDomain))
                            {
                                inlinksCount[targetNormalized] = inlinksCount.GetValueOrDefault(targetNormalized) + 1;
                                pageResult.OutgoingInternalLinks.Add(targetNormalized);

                                if (!discoveredUrls.Contains(targetNormalized) && depth + 1 <= maxDepth && discoveredUrls.Count < maxPages * 3)
                                {
                                    discoveredUrls.Add(targetNormalized);
                                    queue.Enqueue((targetUri, targetNormalized, depth + 1));
                                }
                            }
                        }
                    }

                    results.Add(pageResult);
                    if (onProgressAsync != null)
                    {
                        await onProgressAsync(results.Count, discoveredUrls.Count);
                    }
                    continue;
                }

                // Handle Client / Server Errors (4xx, 5xx)
                if ((int)response.StatusCode >= 400)
                {
                    pageResult.IsIndexable = false;
                    pageResult.IndexabilityStatus = (int)response.StatusCode == 404 ? "NotFound" : "ServerError";
                    results.Add(pageResult);
                    if (onProgressAsync != null)
                    {
                        await onProgressAsync(results.Count, discoveredUrls.Count);
                    }
                    continue;
                }

                // Enforce max content length header if present
                if (response.Content.Headers.ContentLength.HasValue && response.Content.Headers.ContentLength > MaxResponseSizeBytes)
                {
                    pageResult.ContentLengthBytes = response.Content.Headers.ContentLength;
                    pageResult.IsIndexable = false;
                    pageResult.IndexabilityStatus = "ExceedsMaxSize";
                    results.Add(pageResult);
                    continue;
                }

                // Only parse HTML content
                var mediaType = pageResult.ContentType?.ToLowerInvariant() ?? "";
                if (!mediaType.Contains("text/html") && !mediaType.Contains("application/xhtml+xml"))
                {
                    pageResult.ContentLengthBytes = response.Content.Headers.ContentLength ?? 0;
                    pageResult.IsIndexable = false;
                    pageResult.IndexabilityStatus = "NonHtml";
                    results.Add(pageResult);
                    continue;
                }

                // Read body with size cap
                using var contentStream = await response.Content.ReadAsStreamAsync(requestCts.Token);
                using var memoryStream = new MemoryStream();
                var buffer = new byte[8192];
                int totalRead = 0;
                int bytesRead;

                while ((bytesRead = await contentStream.ReadAsync(buffer, 0, buffer.Length, requestCts.Token)) > 0)
                {
                    totalRead += bytesRead;
                    if (totalRead > MaxResponseSizeBytes)
                    {
                        break;
                    }
                    await memoryStream.WriteAsync(buffer.AsMemory(0, bytesRead), requestCts.Token);
                }

                pageResult.ContentLengthBytes = totalRead;
                memoryStream.Position = 0;
                using var reader = new StreamReader(memoryStream);
                var htmlContent = await reader.ReadToEndAsync(requestCts.Token);

                // Parse DOM with AngleSharp
                using var document = await _htmlParser.ParseDocumentAsync(htmlContent, cancellationToken);

                // 1. Title
                var titleText = document.Title?.Trim();
                if (string.IsNullOrEmpty(titleText))
                {
                    titleText = document.QuerySelector("title")?.TextContent?.Trim();
                }
                pageResult.Title = string.IsNullOrWhiteSpace(titleText) ? null : titleText;
                pageResult.TitleLength = pageResult.Title?.Length;

                // 2. Meta Description
                var metaDesc = document.QuerySelector("meta[name='description' i]")?.GetAttribute("content")?.Trim();
                pageResult.MetaDescription = string.IsNullOrWhiteSpace(metaDesc) ? null : metaDesc;

                // 3. H1 Headings
                var h1Elements = document.QuerySelectorAll("h1");
                pageResult.H1Count = h1Elements.Length;
                var firstH1 = h1Elements.FirstOrDefault()?.TextContent?.Trim();
                pageResult.H1 = string.IsNullOrWhiteSpace(firstH1) ? null : firstH1;

                // 4. Canonical URL
                var canonicalHref = document.QuerySelector("link[rel~='canonical' i]")?.GetAttribute("href")?.Trim();
                if (!string.IsNullOrWhiteSpace(canonicalHref))
                {
                    pageResult.CanonicalUrl = _urlNormalizer.Normalize(canonicalHref, currentUri);
                }

                // 5. Indexability Evaluation
                var metaRobots = document.QuerySelector("meta[name='robots' i]")?.GetAttribute("content")?.ToLowerInvariant() ?? "";
                string xRobotsTag = response.Headers.TryGetValues("X-Robots-Tag", out var xRobotsValues)
                    ? string.Join(", ", xRobotsValues).ToLowerInvariant()
                    : "";

                if (metaRobots.Contains("noindex") || xRobotsTag.Contains("noindex"))
                {
                    pageResult.IsIndexable = false;
                    pageResult.IndexabilityStatus = "Noindex";
                }
                else if (!string.IsNullOrWhiteSpace(pageResult.CanonicalUrl) &&
                         !pageResult.CanonicalUrl.Equals(normalizedUrl, StringComparison.OrdinalIgnoreCase))
                {
                    pageResult.IsIndexable = false;
                    pageResult.IndexabilityStatus = "Canonicalized";
                }
                else
                {
                    pageResult.IsIndexable = true;
                    pageResult.IndexabilityStatus = "Indexable";
                }

                // 6. Raw Head Snippet for Diagnostics (capped at 1000 characters)
                var headElement = document.Head;
                if (headElement != null)
                {
                    var headHtml = headElement.OuterHtml;
                    pageResult.RawHeadSnippet = headHtml.Length > 1000 ? headHtml[..1000] : headHtml;
                }

                // 7. Internal Link Discovery
                var anchorElements = document.QuerySelectorAll("a[href]");
                var internalLinksOnPage = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                foreach (var anchor in anchorElements)
                {
                    var href = anchor.GetAttribute("href");
                    if (string.IsNullOrWhiteSpace(href)) continue;

                    // Skip mailto, tel, javascript, purely in-page anchors
                    var trimmed = href.Trim();
                    if (trimmed.StartsWith('#') ||
                        trimmed.StartsWith("javascript:", StringComparison.OrdinalIgnoreCase) ||
                        trimmed.StartsWith("mailto:", StringComparison.OrdinalIgnoreCase) ||
                        trimmed.StartsWith("tel:", StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    var normalizedTarget = _urlNormalizer.Normalize(trimmed, currentUri);
                    if (string.IsNullOrEmpty(normalizedTarget)) continue;

                    if (Uri.TryCreate(normalizedTarget, UriKind.Absolute, out var targetUri))
                    {
                        if (_ssrfValidator.IsWithinDomainBoundary(targetUri, primaryDomain))
                        {
                            internalLinksOnPage.Add(normalizedTarget);
                            inlinksCount[normalizedTarget] = inlinksCount.GetValueOrDefault(normalizedTarget) + 1;

                            if (!discoveredUrls.Contains(normalizedTarget) &&
                                depth + 1 <= maxDepth &&
                                discoveredUrls.Count < maxPages * 3)
                            {
                                discoveredUrls.Add(normalizedTarget);
                                queue.Enqueue((targetUri, normalizedTarget, depth + 1));
                            }
                        }
                    }
                }

                pageResult.OutgoingInternalLinks = internalLinksOnPage.ToList();
                results.Add(pageResult);

                if (onProgressAsync != null)
                {
                    await onProgressAsync(results.Count, discoveredUrls.Count);
                }
            }
            catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
            {
                stopwatch.Stop();
                _logger.LogWarning("Request timed out for '{Url}'", normalizedUrl);
                pageResult.HttpStatusCode = 408; // Request Timeout
                pageResult.LoadTimeMs = (int)stopwatch.ElapsedMilliseconds;
                pageResult.IsIndexable = false;
                pageResult.IndexabilityStatus = "Timeout";
                results.Add(pageResult);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(ex, "Failed to crawl '{Url}': {Message}", normalizedUrl, ex.Message);
                if (depth == 0 && results.Count == 0)
                {
                    throw new CrawlValidationException($"Failed to reach start URL '{normalizedUrl}': {ex.Message}", ex);
                }
                pageResult.HttpStatusCode = 0;
                pageResult.LoadTimeMs = (int)stopwatch.ElapsedMilliseconds;
                pageResult.IsIndexable = false;
                pageResult.IndexabilityStatus = "CrawlError";
                results.Add(pageResult);
            }
        }

        // Post-process inlinks count and outlinks count
        foreach (var page in results)
        {
            page.InlinksCount = inlinksCount.GetValueOrDefault(page.Url, 0);
            page.OutlinksCount = page.OutgoingInternalLinks.Count;
        }

        return results;
    }
}
