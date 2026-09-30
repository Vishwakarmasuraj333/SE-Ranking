using System.Net;
using System.Text.Json;
using InternalSEO.Application.Common.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;
        var correlationId = context.Items["X-Correlation-ID"]?.ToString() ?? traceId;

        ProblemDetails problemDetails;
        int statusCode;

        switch (exception)
        {
            case ValidationException valEx:
                statusCode = (int)HttpStatusCode.BadRequest;
                problemDetails = new ValidationProblemDetails(valEx.Errors)
                {
                    Status = statusCode,
                    Title = "One or more validation errors occurred.",
                    Type = "https://api.seo.internal/errors/validation-failed",
                    Detail = "The request payload failed domain validation rules.",
                    Instance = context.Request.Path
                };
                break;

            case BadRequestException badReqEx:
                statusCode = (int)HttpStatusCode.BadRequest;
                problemDetails = new ProblemDetails
                {
                    Status = statusCode,
                    Title = "Bad Request",
                    Type = "https://api.seo.internal/errors/bad-request",
                    Detail = badReqEx.Message,
                    Instance = context.Request.Path
                };
                break;

            case NotFoundException notFoundEx:
                statusCode = (int)HttpStatusCode.NotFound;
                problemDetails = new ProblemDetails
                {
                    Status = statusCode,
                    Title = "Resource Not Found",
                    Type = "https://api.seo.internal/errors/not-found",
                    Detail = notFoundEx.Message,
                    Instance = context.Request.Path
                };
                break;

            case UnauthorizedException unauthEx:
                statusCode = (int)HttpStatusCode.Unauthorized;
                problemDetails = new ProblemDetails
                {
                    Status = statusCode,
                    Title = "Unauthorized",
                    Type = "https://api.seo.internal/errors/unauthorized",
                    Detail = unauthEx.Message,
                    Instance = context.Request.Path
                };
                break;

            case ForbiddenException forbiddenEx:
                statusCode = (int)HttpStatusCode.Forbidden;
                problemDetails = new ProblemDetails
                {
                    Status = statusCode,
                    Title = "Forbidden",
                    Type = "https://api.seo.internal/errors/forbidden",
                    Detail = forbiddenEx.Message,
                    Instance = context.Request.Path
                };
                break;

            default:
                _logger.LogError(exception, "Unhandled exception occurred while processing request {Path}. TraceId: {TraceId}",
                    context.Request.Path, traceId);

                statusCode = (int)HttpStatusCode.InternalServerError;
                problemDetails = new ProblemDetails
                {
                    Status = statusCode,
                    Title = "Internal Server Error",
                    Type = "https://api.seo.internal/errors/internal-server-error",
                    Detail = "An unexpected error occurred while processing your request.",
                    Instance = context.Request.Path
                };
                break;
        }

        problemDetails.Extensions["traceId"] = traceId;
        problemDetails.Extensions["correlationId"] = correlationId;

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = statusCode;

        var json = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        });

        await context.Response.WriteAsync(json);
    }
}
