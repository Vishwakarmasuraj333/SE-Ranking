using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace InternalSEO.Infrastructure.Services;

public class PasswordHasherService : IPasswordHasherService
{
    private readonly PasswordHasher<User> _hasher = new();

    public string HashPassword(User user, string password)
    {
        return _hasher.HashPassword(user, password);
    }

    public bool VerifyPassword(User user, string password, string passwordHash)
    {
        var result = _hasher.VerifyHashedPassword(user, passwordHash, password);
        return result != PasswordVerificationResult.Failed;
    }
}
