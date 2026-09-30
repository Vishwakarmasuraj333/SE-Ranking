namespace InternalSEO.Application.Common.Interfaces;

public record OAuthStateValidationResult(bool Success, string? ErrorMessage)
{
    public static OAuthStateValidationResult Succeeded() => new(true, null);
    public static OAuthStateValidationResult Failed(string error) => new(false, error);
}

public interface IOAuthNonceService
{
    Task<string> GenerateAndStoreNonceAsync(Guid projectId, Guid userId, string serviceType, CancellationToken cancellationToken = default);
    Task<OAuthStateValidationResult> ValidateAndConsumeNonceAsync(string protectedState, Guid expectedProjectId, Guid expectedUserId, string expectedServiceType, CancellationToken cancellationToken = default);
}
