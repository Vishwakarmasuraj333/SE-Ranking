using InternalSEO.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Api.Controllers;

[ApiController]
[Route("[controller]")]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public HealthController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("/healthz")]
    public async Task<IActionResult> GetHealth()
    {
        var isDbHealthy = false;
        try
        {
            isDbHealthy = await _context.Users.AnyAsync();
        }
        catch
        {
            // If DB is offline or not migrated yet
            isDbHealthy = false;
        }

        var status = isDbHealthy ? "Healthy" : "Degraded";

        return Ok(new
        {
            status,
            timestamp = DateTimeOffset.UtcNow,
            version = "1.0.0",
            checks = new
            {
                database = isDbHealthy ? "Healthy" : "Unhealthy",
                api = "Healthy"
            }
        });
    }
}
