using FluentValidation.Results;

namespace InternalSEO.Application.Common.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string name, object key)
        : base($"Entity \"{name}\" ({key}) was not found.")
    {
    }

    public NotFoundException(string message)
        : base(message)
    {
    }
}

public class BadRequestException : Exception
{
    public BadRequestException(string message)
        : base(message)
    {
    }
}

public class ForbiddenException : Exception
{
    public ForbiddenException(string message = "You do not have permission to access this resource.")
        : base(message)
    {
    }
}

public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message = "Authentication failed or token is invalid.")
        : base(message)
    {
    }
}

public class ValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException()
        : base("One or more validation failures have occurred.")
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IEnumerable<ValidationFailure> failures)
        : this()
    {
        Errors = failures
            .GroupBy(e => e.PropertyName, e => e.ErrorMessage)
            .ToDictionary(failureGroup => failureGroup.Key, failureGroup => failureGroup.ToArray());
    }
}

public class CrawlValidationException : Exception
{
    public CrawlValidationException(string message)
        : base(message)
    {
    }

    public CrawlValidationException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}

public class GoogleOAuthException : Exception
{
    public System.Net.HttpStatusCode? StatusCode { get; }
    public string? ErrorCode { get; }
    public bool IsAuthenticationFailure { get; }

    public GoogleOAuthException(
        string message,
        System.Net.HttpStatusCode? statusCode = null,
        string? errorCode = null,
        bool isAuthFailure = false)
        : base(message)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
        IsAuthenticationFailure = isAuthFailure;
    }
}


