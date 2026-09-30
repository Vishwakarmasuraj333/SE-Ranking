namespace InternalSEO.Application.Common.Interfaces;

public interface ISsrfValidator
{
    Task<(bool IsSafe, string? Reason)> ValidateUrlAsync(Uri uri, string allowedDomain, CancellationToken cancellationToken = default);
    bool IsWithinDomainBoundary(Uri uri, string allowedDomain);
}
