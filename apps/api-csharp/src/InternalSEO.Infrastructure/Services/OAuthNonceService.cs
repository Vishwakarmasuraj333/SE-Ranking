using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InternalSEO.Infrastructure.Services;

public class OAuthNonceService : IOAuthNonceService
{
    private const string Purpose = "OAuth.State.Nonce.v1";
    private readonly IApplicationDbContext _context;
    private readonly IDataProtector _protector;
    private readonly ILogger<OAuthNonceService> _logger;

    public OAuthNonceService(
        IApplicationDbContext context,
        IDataProtectionProvider dataProtectionProvider,
        ILogger<OAuthNonceService> logger)
    {
        _context = context;
        _protector = dataProtectionProvider.CreateProtector(Purpose);
        _logger = logger;
    }

    public async Task<string> GenerateAndStoreNonceAsync(
        Guid projectId, 
        Guid userId, 
        string serviceType, 
        CancellationToken cancellationToken = default)
    {
        var rawNonceBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(rawNonceBytes);
        }
        var rawNonce = Convert.ToHexString(rawNonceBytes).ToLowerInvariant();
        var nonceHash = ComputeSha256(rawNonce);

        var now = DateTimeOffset.UtcNow;
        var expiresAt = now.AddMinutes(15);

        var record = new OAuthNonce
        {
            NonceHash = nonceHash,
            ProjectId = projectId,
            UserId = userId,
            ServiceType = serviceType,
            ExpiresAt = expiresAt,
            CreatedAt = now
        };

        _context.OAuthNonces.Add(record);
        await _context.SaveChangesAsync(cancellationToken);

        var payload = new OAuthStatePayload(
            ProjectId: projectId,
            UserId: userId,
            ServiceType: serviceType,
            IssuedAtUtc: now,
            ExpiresAtUtc: expiresAt,
            RawNonce: rawNonce
        );

        var serialized = JsonSerializer.Serialize(payload);
        return _protector.Protect(serialized);
    }

    public async Task<OAuthStateValidationResult> ValidateAndConsumeNonceAsync(
        string protectedState, 
        Guid expectedProjectId, 
        Guid expectedUserId, 
        string expectedServiceType, 
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(protectedState))
        {
            return OAuthStateValidationResult.Failed("Missing OAuth state parameter.");
        }

        string unprotectedJson;
        try
        {
            unprotectedJson = _protector.Unprotect(protectedState);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "OAuth state unprotection failed - invalid or tampered token.");
            return OAuthStateValidationResult.Failed("Invalid or tampered OAuth state parameter.");
        }

        OAuthStatePayload? payload;
        try
        {
            payload = JsonSerializer.Deserialize<OAuthStatePayload>(unprotectedJson);
        }
        catch
        {
            return OAuthStateValidationResult.Failed("Malformed OAuth state payload.");
        }

        if (payload == null || string.IsNullOrWhiteSpace(payload.RawNonce))
        {
            return OAuthStateValidationResult.Failed("Malformed OAuth state payload.");
        }

        if (payload.ProjectId != expectedProjectId)
        {
            _logger.LogWarning("OAuth state project mismatch. Expected {Expected}, got {Actual}", expectedProjectId, payload.ProjectId);
            return OAuthStateValidationResult.Failed("OAuth state project mismatch.");
        }

        if (payload.UserId != expectedUserId)
        {
            _logger.LogWarning("OAuth state user mismatch. Expected {Expected}, got {Actual}", expectedUserId, payload.UserId);
            return OAuthStateValidationResult.Failed("OAuth state user mismatch.");
        }

        if (!string.Equals(payload.ServiceType, expectedServiceType, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("OAuth state service mismatch. Expected {Expected}, got {Actual}", expectedServiceType, payload.ServiceType);
            return OAuthStateValidationResult.Failed("OAuth state service mismatch.");
        }

        var now = DateTimeOffset.UtcNow;
        if (payload.ExpiresAtUtc <= now)
        {
            return OAuthStateValidationResult.Failed("OAuth state has expired.");
        }

        var nonceHash = ComputeSha256(payload.RawNonce);

        int rowsAffected;
        if (_context is DbContext dbContext && dbContext.Database.IsRelational())
        {
            // Atomic one-time consumption for Relational DB (SQL Server / SQLite)
            rowsAffected = await _context.OAuthNonces
                .Where(n => n.NonceHash == nonceHash 
                         && n.ProjectId == expectedProjectId 
                         && n.UserId == expectedUserId 
                         && n.ConsumedAt == null 
                         && n.ExpiresAt > now)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.ConsumedAt, now), cancellationToken);
        }
        else
        {
            // Fallback for InMemory provider in unit tests
            var record = await _context.OAuthNonces
                .FirstOrDefaultAsync(n => n.NonceHash == nonceHash 
                                       && n.ProjectId == expectedProjectId 
                                       && n.UserId == expectedUserId 
                                       && n.ConsumedAt == null 
                                       && n.ExpiresAt > now, cancellationToken);
            if (record != null)
            {
                record.ConsumedAt = now;
                await _context.SaveChangesAsync(cancellationToken);
                rowsAffected = 1;
            }
            else
            {
                rowsAffected = 0;
            }
        }

        if (rowsAffected != 1)
        {
            _logger.LogWarning("OAuth state consumption rejected for nonce hash {Hash}. Rows affected: {Count}", nonceHash, rowsAffected);
            return OAuthStateValidationResult.Failed("OAuth state has already been consumed, expired, or does not exist.");
        }

        return OAuthStateValidationResult.Succeeded();
    }

    private static string ComputeSha256(string input)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private record OAuthStatePayload(
        Guid ProjectId,
        Guid UserId,
        string ServiceType,
        DateTimeOffset IssuedAtUtc,
        DateTimeOffset ExpiresAtUtc,
        string RawNonce
    );
}
