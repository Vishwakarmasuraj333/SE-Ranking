using InternalSEO.Domain.Entities;

namespace InternalSEO.Application.Common.Interfaces;

public interface IPasswordHasherService
{
    string HashPassword(User user, string password);
    bool VerifyPassword(User user, string password, string passwordHash);
}
