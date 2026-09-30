using System.Security.Cryptography;
using System.Text;
using System.Web;
using InternalSEO.Application.Common.Interfaces;

namespace InternalSEO.Infrastructure.Services;

public class UrlNormalizer : IUrlNormalizer
{
    private static readonly HashSet<string> IgnoredQueryParams = new(StringComparer.OrdinalIgnoreCase)
    {
        "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
        "fbclid", "gclid", "msclkid", "_ga", "ref"
    };

    public string Normalize(Uri uri)
    {
        if (uri == null) return string.Empty;

        var scheme = uri.Scheme.ToLowerInvariant();
        var host = uri.Host.ToLowerInvariant();
        var port = uri.IsDefaultPort ? "" : $":{uri.Port}";

        // Normalize Path
        var path = uri.AbsolutePath;
        if (string.IsNullOrEmpty(path))
        {
            path = "/";
        }
        else
        {
            // Remove consecutive slashes
            while (path.Contains("//"))
            {
                path = path.Replace("//", "/");
            }

            // Remove trailing slash if length > 1
            if (path.Length > 1 && path.EndsWith('/'))
            {
                path = path.TrimEnd('/');
            }
        }

        // Normalize Query string
        var query = string.Empty;
        if (!string.IsNullOrEmpty(uri.Query) && uri.Query.Length > 1)
        {
            var queryParams = HttpUtility.ParseQueryString(uri.Query);
            var filtered = new SortedDictionary<string, string>(StringComparer.Ordinal);

            foreach (string? key in queryParams.AllKeys)
            {
                if (!string.IsNullOrWhiteSpace(key) && !IgnoredQueryParams.Contains(key))
                {
                    filtered[key] = queryParams[key] ?? "";
                }
            }

            if (filtered.Count > 0)
            {
                var sb = new StringBuilder();
                foreach (var kvp in filtered)
                {
                    if (sb.Length > 0) sb.Append('&');
                    sb.Append(Uri.EscapeDataString(kvp.Key));
                    if (!string.IsNullOrEmpty(kvp.Value))
                    {
                        sb.Append('=');
                        sb.Append(Uri.EscapeDataString(kvp.Value));
                    }
                }
                query = "?" + sb.ToString();
            }
        }

        return $"{scheme}://{host}{port}{path}{query}";
    }

    public string Normalize(string urlString, Uri baseUri)
    {
        if (string.IsNullOrWhiteSpace(urlString)) return string.Empty;

        // Trim whitespace and remove fragments
        var clean = urlString.Trim();
        var hashIdx = clean.IndexOf('#');
        if (hashIdx >= 0)
        {
            clean = clean[..hashIdx];
        }

        if (string.IsNullOrWhiteSpace(clean)) return string.Empty;

        if (Uri.TryCreate(baseUri, clean, out var resolvedUri))
        {
            return Normalize(resolvedUri);
        }

        return string.Empty;
    }

    public string ComputeSha256Hash(string normalizedUrl)
    {
        if (string.IsNullOrEmpty(normalizedUrl)) return string.Empty;

        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(normalizedUrl));
        var sb = new StringBuilder(bytes.Length * 2);
        foreach (var b in bytes)
        {
            sb.Append(b.ToString("x2"));
        }
        return sb.ToString();
    }
}
