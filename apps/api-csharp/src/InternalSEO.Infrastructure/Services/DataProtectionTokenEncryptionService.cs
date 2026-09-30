using InternalSEO.Application.Common.Interfaces;
using Microsoft.AspNetCore.DataProtection;

namespace InternalSEO.Infrastructure.Services;

public class DataProtectionTokenEncryptionService : ITokenEncryptionService
{
    private readonly IDataProtector _protector;

    public DataProtectionTokenEncryptionService(IDataProtectionProvider dataProtectionProvider)
    {
        _protector = dataProtectionProvider.CreateProtector("InternalSEO.GoogleAuth.RefreshToken.v1");
    }

    public string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
            return string.Empty;

        return _protector.Protect(plainText);
    }

    public string Decrypt(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText))
            return string.Empty;

        return _protector.Unprotect(cipherText);
    }
}
