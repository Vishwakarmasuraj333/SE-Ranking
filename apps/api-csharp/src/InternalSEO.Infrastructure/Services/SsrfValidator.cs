using System.Net;
using System.Net.Sockets;
using InternalSEO.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace InternalSEO.Infrastructure.Services;

public class SsrfValidator : ISsrfValidator
{
    private static readonly HashSet<string> DisallowedMetadataHosts = new(StringComparer.OrdinalIgnoreCase)
    {
        "169.254.169.254", // AWS/Azure/GCP metadata
        "metadata.google.internal"
    };

    private static readonly HashSet<string> LoopbackHosts = new(StringComparer.OrdinalIgnoreCase)
    {
        "localhost",
        "127.0.0.1",
        "::1",
        "0.0.0.0"
    };

    private readonly bool _allowLoopbackTestHarness;
    private readonly int? _testHarnessPort;

    public SsrfValidator(IConfiguration? configuration = null)
    {
        _allowLoopbackTestHarness = bool.TryParse(configuration?["Crawler:AllowLoopbackTestHarness"], out var allow) && allow;
        _testHarnessPort = int.TryParse(configuration?["Crawler:TestHarnessPort"], out var port) ? port : null;
    }

    public async Task<(bool IsSafe, string? Reason)> ValidateUrlAsync(Uri uri, string allowedDomain, CancellationToken cancellationToken = default)
    {
        if (uri == null)
            return (false, "URL is null.");

        // 1. Enforce Scheme: HTTP/HTTPS only
        if (!uri.Scheme.Equals("http", StringComparison.OrdinalIgnoreCase) &&
            !uri.Scheme.Equals("https", StringComparison.OrdinalIgnoreCase))
        {
            return (false, $"Unsupported URL scheme '{uri.Scheme}'. Only HTTP and HTTPS are permitted.");
        }

        // 2. Enforce Domain Boundary
        if (!IsWithinDomainBoundary(uri, allowedDomain))
        {
            return (false, $"Host '{uri.Host}' is outside the allowed project domain '{allowedDomain}'.");
        }

        // 3. Block Cloud Metadata Hosts unconditionally
        if (DisallowedMetadataHosts.Contains(uri.Host))
        {
            return (false, $"Access to restricted host '{uri.Host}' is blocked.");
        }

        // 4. Block Loopback Hosts unless explicitly configured for test harness
        bool isLoopback = LoopbackHosts.Contains(uri.Host);
        if (isLoopback)
        {
            if (!_allowLoopbackTestHarness || (_testHarnessPort.HasValue && uri.Port != _testHarnessPort.Value))
            {
                return (false, $"Access to restricted host '{uri.Host}' is blocked.");
            }
        }

        // 5. Validate IP / DNS Destination
        try
        {
            IPAddress[] addresses;
            if (IPAddress.TryParse(uri.Host, out var directIp))
            {
                addresses = new[] { directIp };
            }
            else
            {
                addresses = await Dns.GetHostAddressesAsync(uri.DnsSafeHost, cancellationToken);
            }

            if (addresses.Length == 0)
            {
                return (false, $"Host '{uri.Host}' could not be resolved.");
            }

            foreach (var ip in addresses)
            {
                if (IPAddress.IsLoopback(ip) && isLoopback && _allowLoopbackTestHarness)
                {
                    // Permitted explicitly for isolated loopback test harness
                    continue;
                }

                if (IsPrivateOrRestrictedIp(ip))
                {
                    return (false, $"Destination IP '{ip}' belongs to a private, loopback, or cloud-metadata network and is blocked.");
                }
            }
        }
        catch (SocketException ex)
        {
            return (false, $"DNS resolution failed for host '{uri.Host}': {ex.Message}");
        }
        catch (Exception ex)
        {
            return (false, $"Security validation failed for URL '{uri}': {ex.Message}");
        }

        return (true, null);
    }

    public bool IsWithinDomainBoundary(Uri uri, string allowedDomain)
    {
        if (uri == null || string.IsNullOrWhiteSpace(allowedDomain))
            return false;

        var cleanAllowed = allowedDomain
            .Replace("https://", "", StringComparison.OrdinalIgnoreCase)
            .Replace("http://", "", StringComparison.OrdinalIgnoreCase)
            .Trim()
            .TrimEnd('/')
            .ToLowerInvariant();

        if (cleanAllowed.Contains(':'))
        {
            cleanAllowed = cleanAllowed.Split(':')[0];
        }

        var host = uri.Host.ToLowerInvariant();

        return host == cleanAllowed || host.EndsWith("." + cleanAllowed, StringComparison.OrdinalIgnoreCase);
    }

    public static bool IsPrivateOrRestrictedIp(IPAddress ip)
    {
        if (IPAddress.IsLoopback(ip))
            return true;

        if (ip.AddressFamily == AddressFamily.InterNetworkV6)
        {
            if (ip.IsIPv6LinkLocal || ip.IsIPv6Multicast || ip.IsIPv6SiteLocal)
                return true;

            // IPv6 Unique Local (fc00::/7)
            var bytes = ip.GetAddressBytes();
            if ((bytes[0] & 0xfe) == 0xfc)
                return true;

            // IPv4-mapped IPv6
            if (ip.IsIPv4MappedToIPv6)
            {
                return IsPrivateOrRestrictedIp(ip.MapToIPv4());
            }

            return false;
        }

        if (ip.AddressFamily == AddressFamily.InterNetwork)
        {
            var bytes = ip.GetAddressBytes();

            // 0.0.0.0/8
            if (bytes[0] == 0) return true;

            // 10.0.0.0/8 (Private RFC 1918)
            if (bytes[0] == 10) return true;

            // 127.0.0.0/8 (Loopback)
            if (bytes[0] == 127) return true;

            // 169.254.0.0/16 (Link-Local & Cloud Metadata RFC 3927)
            if (bytes[0] == 169 && bytes[1] == 254) return true;

            // 172.16.0.0/12 (Private RFC 1918: 172.16.0.0 - 172.31.255.255)
            if (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31) return true;

            // 192.168.0.0/16 (Private RFC 1918)
            if (bytes[0] == 192 && bytes[1] == 168) return true;

            // 255.255.255.255 (Broadcast)
            if (bytes[0] == 255 && bytes[1] == 255 && bytes[2] == 255 && bytes[3] == 255) return true;
        }

        return false;
    }
}
