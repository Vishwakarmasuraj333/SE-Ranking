namespace InternalSEO.Domain.Constants;

public static class SystemRoles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string SEOExecutive = "SEOExecutive";
    public const string Viewer = "Viewer";

    public static readonly IReadOnlyList<string> All = new[] { SuperAdmin, SEOExecutive, Viewer };
}
