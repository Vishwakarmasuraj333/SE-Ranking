namespace InternalSEO.Application.Features.Competitors.Common;

public static class CompetitorNormalizer
{
    public static string NormalizeDomain(string? rawInput)
    {
        if (string.IsNullOrWhiteSpace(rawInput))
            return string.Empty;

        var input = rawInput.Trim().ToLowerInvariant();

        // If scheme is missing, prepend https:// temporarily so Uri parser can handle it properly
        if (!input.StartsWith("http://", StringComparison.OrdinalIgnoreCase) &&
            !input.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            input = "https://" + input;
        }

        if (Uri.TryCreate(input, UriKind.Absolute, out var uri))
        {
            var host = uri.Host.Trim().ToLowerInvariant();
            if (host.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
            {
                host = host.Substring(4);
            }
            return host.TrimEnd('/');
        }

        // Fallback: manual trimming
        var fallback = rawInput.Trim().ToLowerInvariant();
        if (fallback.StartsWith("http://")) fallback = fallback.Substring(7);
        if (fallback.StartsWith("https://")) fallback = fallback.Substring(8);
        if (fallback.StartsWith("www.")) fallback = fallback.Substring(4);
        var slashIdx = fallback.IndexOfAny(new[] { '/', '?', '#' });
        if (slashIdx >= 0) fallback = fallback.Substring(0, slashIdx);

        return fallback.Trim();
    }
}
