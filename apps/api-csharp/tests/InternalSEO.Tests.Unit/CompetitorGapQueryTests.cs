using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Competitors.Queries;
using InternalSEO.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace InternalSEO.Tests.Unit;

public class CompetitorGapQueryTests
{
    private static IApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<InternalSEO.Infrastructure.Persistence.ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new InternalSEO.Infrastructure.Persistence.ApplicationDbContext(options);
    }

    [Fact]
    public async Task Handle_PopulatedGap_TargetOutsideTop20_CompetitorInTop20_Included()
    {
        var context = CreateInMemoryDbContext();
        var projectId = Guid.NewGuid();
        var project = new Project { Id = projectId, Name = "Test Project", PrimaryDomain = "target.com" };
        context.Projects.Add(project);

        var competitor = new Competitor { Id = Guid.NewGuid(), ProjectId = projectId, Name = "Rival A", Domain = "rival-a.com" };
        context.Competitors.Add(competitor);

        var keyword = new Keyword
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            KeywordText = "enterprise seo",
            MonthlySearchVolume = 1000,
            IsActive = true
        };
        context.Keywords.Add(keyword);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Target ranks at 25 (outside top 20)
        context.RankResults.Add(new RankResult
        {
            Id = 1,
            ProjectId = projectId,
            KeywordId = keyword.Id,
            CheckDate = today,
            Position = 25,
            RecordedAt = DateTimeOffset.UtcNow
        });

        // Competitor ranks at 3 (inside top 20)
        context.CompetitorRankResults.Add(new CompetitorRankResult
        {
            Id = 1,
            ProjectId = projectId,
            KeywordId = keyword.Id,
            CompetitorId = competitor.Id,
            CheckDate = today,
            Position = 3,
            RecordedAt = DateTimeOffset.UtcNow
        });

        await context.SaveChangesAsync(CancellationToken.None);

        var handler = new GetCompetitorGapQueryHandler(context);
        var result = await handler.Handle(new GetCompetitorGapQuery(projectId), CancellationToken.None);

        Assert.True(result.Success);
        Assert.Single(result.Data!.Items);
        var item = result.Data.Items[0];
        Assert.Equal(keyword.Id, item.KeywordId);
        Assert.Equal(3, item.BestCompetitorPosition);
        Assert.Equal(25, item.TargetPosition);
        Assert.Equal(competitor.Id, item.BestCompetitorId);
        Assert.Equal(18.7, item.OpportunityScore); // 1000 * 18.7 / 1000 = 18.7
        Assert.True(item.IsActive);
    }

    [Fact]
    public async Task Handle_TargetInsideTop20_ExcludedFromGap()
    {
        var context = CreateInMemoryDbContext();
        var projectId = Guid.NewGuid();
        var project = new Project { Id = projectId, Name = "Test Project", PrimaryDomain = "target.com" };
        context.Projects.Add(project);

        var competitor = new Competitor { Id = Guid.NewGuid(), ProjectId = projectId, Name = "Rival A", Domain = "rival-a.com" };
        context.Competitors.Add(competitor);

        var keyword = new Keyword
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            KeywordText = "enterprise seo",
            MonthlySearchVolume = 1000,
            IsActive = true
        };
        context.Keywords.Add(keyword);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Target ranks at 5 (inside Top 20)
        context.RankResults.Add(new RankResult
        {
            Id = 1,
            ProjectId = projectId,
            KeywordId = keyword.Id,
            CheckDate = today,
            Position = 5,
            RecordedAt = DateTimeOffset.UtcNow
        });

        // Competitor ranks at 3
        context.CompetitorRankResults.Add(new CompetitorRankResult
        {
            Id = 1,
            ProjectId = projectId,
            KeywordId = keyword.Id,
            CompetitorId = competitor.Id,
            CheckDate = today,
            Position = 3,
            RecordedAt = DateTimeOffset.UtcNow
        });

        await context.SaveChangesAsync(CancellationToken.None);

        var handler = new GetCompetitorGapQueryHandler(context);
        var result = await handler.Handle(new GetCompetitorGapQuery(projectId), CancellationToken.None);

        Assert.True(result.Success);
        Assert.Empty(result.Data!.Items);
    }

    [Fact]
    public async Task Handle_TargetNullUnranked_IncludedInGap()
    {
        var context = CreateInMemoryDbContext();
        var projectId = Guid.NewGuid();
        var project = new Project { Id = projectId, Name = "Test Project", PrimaryDomain = "target.com" };
        context.Projects.Add(project);

        var competitor = new Competitor { Id = Guid.NewGuid(), ProjectId = projectId, Name = "Rival A", Domain = "rival-a.com" };
        context.Competitors.Add(competitor);

        var keyword = new Keyword
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            KeywordText = "unranked keyword",
            MonthlySearchVolume = 2000,
            IsActive = false // Inactive keyword
        };
        context.Keywords.Add(keyword);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Target is unranked (null Position)
        context.RankResults.Add(new RankResult
        {
            Id = 1,
            ProjectId = projectId,
            KeywordId = keyword.Id,
            CheckDate = today,
            Position = null,
            RecordedAt = DateTimeOffset.UtcNow
        });

        // Competitor ranks at 1
        context.CompetitorRankResults.Add(new CompetitorRankResult
        {
            Id = 1,
            ProjectId = projectId,
            KeywordId = keyword.Id,
            CompetitorId = competitor.Id,
            CheckDate = today,
            Position = 1,
            RecordedAt = DateTimeOffset.UtcNow
        });

        await context.SaveChangesAsync(CancellationToken.None);

        var handler = new GetCompetitorGapQueryHandler(context);
        var result = await handler.Handle(new GetCompetitorGapQuery(projectId), CancellationToken.None);

        Assert.True(result.Success);
        Assert.Single(result.Data!.Items);
        var item = result.Data.Items[0];
        Assert.Null(item.TargetPosition);
        Assert.Equal(1, item.BestCompetitorPosition);
        Assert.False(item.IsActive); // Inactive keyword correctly identified
        Assert.Equal(63.4, item.OpportunityScore); // 2000 * 31.7 / 1000 = 63.4
    }

    [Fact]
    public async Task Handle_MultipleCompetitors_SelectsLowestPosition_AndAppliesTieBreaker()
    {
        var context = CreateInMemoryDbContext();
        var projectId = Guid.NewGuid();
        context.Projects.Add(new Project { Id = projectId, Name = "P", PrimaryDomain = "p.com" });

        var compAId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        var compBId = Guid.Parse("00000000-0000-0000-0000-000000000002");
        var compCId = Guid.Parse("00000000-0000-0000-0000-000000000003");

        context.Competitors.Add(new Competitor { Id = compAId, ProjectId = projectId, Name = "Comp A", Domain = "a.com" });
        context.Competitors.Add(new Competitor { Id = compBId, ProjectId = projectId, Name = "Comp B", Domain = "b.com" });
        context.Competitors.Add(new Competitor { Id = compCId, ProjectId = projectId, Name = "Comp C", Domain = "c.com" });

        var kw1 = new Keyword { Id = Guid.NewGuid(), ProjectId = projectId, KeywordText = "kw1", MonthlySearchVolume = 500 };
        var kwTie = new Keyword { Id = Guid.NewGuid(), ProjectId = projectId, KeywordText = "kwtie", MonthlySearchVolume = 500 };
        context.Keywords.AddRange(kw1, kwTie);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // kw1: Comp A = 12, Comp B = 4, Comp C = 18 -> Best = Comp B (pos 4)
        context.CompetitorRankResults.Add(new CompetitorRankResult { Id = 1, ProjectId = projectId, KeywordId = kw1.Id, CompetitorId = compAId, CheckDate = today, Position = 12 });
        context.CompetitorRankResults.Add(new CompetitorRankResult { Id = 2, ProjectId = projectId, KeywordId = kw1.Id, CompetitorId = compBId, CheckDate = today, Position = 4 });
        context.CompetitorRankResults.Add(new CompetitorRankResult { Id = 3, ProjectId = projectId, KeywordId = kw1.Id, CompetitorId = compCId, CheckDate = today, Position = 18 });

        // kwTie: Comp A = 7, Comp B = 7 -> Both tied at pos 7. Deterministic tie-breaker: compAId < compBId
        context.CompetitorRankResults.Add(new CompetitorRankResult { Id = 4, ProjectId = projectId, KeywordId = kwTie.Id, CompetitorId = compBId, CheckDate = today, Position = 7 });
        context.CompetitorRankResults.Add(new CompetitorRankResult { Id = 5, ProjectId = projectId, KeywordId = kwTie.Id, CompetitorId = compAId, CheckDate = today, Position = 7 });

        await context.SaveChangesAsync(CancellationToken.None);

        var handler = new GetCompetitorGapQueryHandler(context);
        var result = await handler.Handle(new GetCompetitorGapQuery(projectId), CancellationToken.None);

        Assert.Equal(2, result.Data!.Items.Count);

        var item1 = result.Data.Items.First(x => x.KeywordId == kw1.Id);
        Assert.Equal(compBId, item1.BestCompetitorId);
        Assert.Equal(4, item1.BestCompetitorPosition);

        var itemTie = result.Data.Items.First(x => x.KeywordId == kwTie.Id);
        Assert.Equal(compAId, itemTie.BestCompetitorId); // Comp A chosen via deterministic ID tie-breaker
        Assert.Equal(7, itemTie.BestCompetitorPosition);
    }

    [Fact]
    public async Task Handle_SameDayObservation_PicksLatestRecordedAt()
    {
        var context = CreateInMemoryDbContext();
        var projectId = Guid.NewGuid();
        context.Projects.Add(new Project { Id = projectId, Name = "P", PrimaryDomain = "p.com" });

        var competitor = new Competitor { Id = Guid.NewGuid(), ProjectId = projectId, Name = "Comp", Domain = "c.com" };
        context.Competitors.Add(competitor);

        var kw = new Keyword { Id = Guid.NewGuid(), ProjectId = projectId, KeywordText = "same day", MonthlySearchVolume = 1000 };
        context.Keywords.Add(kw);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Earlier observation today was pos 25 (outside top 20)
        context.CompetitorRankResults.Add(new CompetitorRankResult
        {
            Id = 1,
            ProjectId = projectId,
            KeywordId = kw.Id,
            CompetitorId = competitor.Id,
            CheckDate = today,
            Position = 25,
            RecordedAt = DateTimeOffset.UtcNow.AddMinutes(-30)
        });

        // Later observation today improved to pos 2 (inside top 20)
        context.CompetitorRankResults.Add(new CompetitorRankResult
        {
            Id = 2,
            ProjectId = projectId,
            KeywordId = kw.Id,
            CompetitorId = competitor.Id,
            CheckDate = today,
            Position = 2,
            RecordedAt = DateTimeOffset.UtcNow
        });

        await context.SaveChangesAsync(CancellationToken.None);

        var handler = new GetCompetitorGapQueryHandler(context);
        var result = await handler.Handle(new GetCompetitorGapQuery(projectId), CancellationToken.None);

        Assert.Single(result.Data!.Items);
        Assert.Equal(2, result.Data.Items[0].BestCompetitorPosition);
        Assert.Equal(24.7, result.Data.Items[0].OpportunityScore);
    }

    [Fact]
    public async Task Handle_CompetitorFilter_AppliesCorrectly()
    {
        var context = CreateInMemoryDbContext();
        var projectId = Guid.NewGuid();
        context.Projects.Add(new Project { Id = projectId, Name = "P", PrimaryDomain = "p.com" });

        var comp1 = new Competitor { Id = Guid.NewGuid(), ProjectId = projectId, Name = "C1", Domain = "c1.com" };
        var comp2 = new Competitor { Id = Guid.NewGuid(), ProjectId = projectId, Name = "C2", Domain = "c2.com" };
        context.Competitors.AddRange(comp1, comp2);

        var kw1 = new Keyword { Id = Guid.NewGuid(), ProjectId = projectId, KeywordText = "kw1", MonthlySearchVolume = 100 };
        var kw2 = new Keyword { Id = Guid.NewGuid(), ProjectId = projectId, KeywordText = "kw2", MonthlySearchVolume = 100 };
        context.Keywords.AddRange(kw1, kw2);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // kw1 ranked by comp1 only
        context.CompetitorRankResults.Add(new CompetitorRankResult { Id = 1, ProjectId = projectId, KeywordId = kw1.Id, CompetitorId = comp1.Id, CheckDate = today, Position = 2 });
        // kw2 ranked by comp2 only
        context.CompetitorRankResults.Add(new CompetitorRankResult { Id = 2, ProjectId = projectId, KeywordId = kw2.Id, CompetitorId = comp2.Id, CheckDate = today, Position = 4 });

        await context.SaveChangesAsync(CancellationToken.None);

        var handler = new GetCompetitorGapQueryHandler(context);

        // Filter by comp1 -> returns kw1 only
        var result = await handler.Handle(new GetCompetitorGapQuery(projectId, CompetitorId: comp1.Id), CancellationToken.None);
        Assert.Single(result.Data!.Items);
        Assert.Equal(kw1.Id, result.Data.Items[0].KeywordId);
    }

    [Fact]
    public async Task Handle_MismatchedCompetitorId_ThrowsNotFoundException()
    {
        var context = CreateInMemoryDbContext();
        var projectId = Guid.NewGuid();
        context.Projects.Add(new Project { Id = projectId, Name = "P", PrimaryDomain = "p.com" });

        var foreignCompId = Guid.NewGuid(); // belongs to another project or does not exist

        var handler = new GetCompetitorGapQueryHandler(context);
        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new GetCompetitorGapQuery(projectId, CompetitorId: foreignCompId), CancellationToken.None));
    }
}
