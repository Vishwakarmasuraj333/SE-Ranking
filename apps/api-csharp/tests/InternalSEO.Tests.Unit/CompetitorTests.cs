using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using FluentValidation.TestHelper;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Competitors.Commands;
using InternalSEO.Application.Features.Competitors.Common;
using InternalSEO.Application.Features.Competitors.DTOs;
using InternalSEO.Application.Features.Competitors.Queries;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace InternalSEO.Tests.Unit;

public class CompetitorTests
{
    private readonly Mock<IActivityLogger> _mockActivityLogger;
    private readonly Mock<ICurrentUserService> _mockCurrentUser;

    public CompetitorTests()
    {
        _mockActivityLogger = new Mock<IActivityLogger>();
        _mockCurrentUser = new Mock<ICurrentUserService>();
        _mockCurrentUser.Setup(u => u.UserId).Returns(Guid.NewGuid());
    }

    private static IApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<InternalSEO.Infrastructure.Persistence.ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new InternalSEO.Infrastructure.Persistence.ApplicationDbContext(options);
    }

    [Theory]
    [InlineData("https://www.Competitor-A.com/path?param=1", "competitor-a.com")]
    [InlineData("http://Competitor-A.com/", "competitor-a.com")]
    [InlineData("WWW.COMPETITOR-B.COM", "competitor-b.com")]
    [InlineData("competitor-c.com/sub/dir", "competitor-c.com")]
    [InlineData("https://sub.competitor-d.com", "sub.competitor-d.com")]
    public void CompetitorNormalizer_NormalizesConsistently(string input, string expected)
    {
        var result = CompetitorNormalizer.NormalizeDomain(input);
        Assert.Equal(expected, result);
    }

    [Fact]
    public void SearchVisibilityCalculator_CalculatesExpectedWeights()
    {
        Assert.Equal(31.7m, SearchVisibilityCalculator.CalculateWeight(1));
        Assert.Equal(24.7m, SearchVisibilityCalculator.CalculateWeight(2));
        Assert.Equal(18.7m, SearchVisibilityCalculator.CalculateWeight(3));
        Assert.Equal(13.6m, SearchVisibilityCalculator.CalculateWeight(4));
        Assert.Equal(9.5m, SearchVisibilityCalculator.CalculateWeight(5));
        Assert.Equal(3.5m, SearchVisibilityCalculator.CalculateWeight(10));
        Assert.Equal(1.5m, SearchVisibilityCalculator.CalculateWeight(20));
        Assert.Equal(0.7m, SearchVisibilityCalculator.CalculateWeight(30));
        Assert.Equal(0.1m, SearchVisibilityCalculator.CalculateWeight(100));
        Assert.Equal(0m, SearchVisibilityCalculator.CalculateWeight(null));
        Assert.Equal(0m, SearchVisibilityCalculator.CalculateWeight(101));
    }

    [Fact]
    public void SearchVisibilityCalculator_ComputesParityWithExistingFormula()
    {
        // 2 keywords: pos 1 (31.7), pos 2 (24.7) -> (31.7 + 24.7) / 2 = 56.4 / 2 = 28.2
        var score = SearchVisibilityCalculator.CalculateScore(new int?[] { 1, 2 }, 2);
        Assert.Equal(28.2m, score);
    }

    [Fact]
    public async Task AddCompetitorCommand_EnforcesMax5Competitors()
    {
        var context = CreateInMemoryDbContext();
        var projectId = Guid.NewGuid();
        var project = new Project
        {
            Id = projectId,
            Name = "Test Project",
            PrimaryDomain = "primary.com"
        };
        context.Projects.Add(project);

        for (int i = 1; i <= 5; i++)
        {
            context.Competitors.Add(new Competitor
            {
                ProjectId = projectId,
                Name = $"Competitor {i}",
                Domain = $"comp{i}.com"
            });
        }
        await context.SaveChangesAsync();

        var validator = new AddCompetitorCommandValidator(context);
        var command = new AddCompetitorCommand(projectId, "Competitor 6", "comp6.com", null);

        var result = await validator.TestValidateAsync(command);
        result.ShouldHaveValidationErrorFor("Competitors");
    }

    [Fact]
    public async Task AddCompetitorCommand_RejectsTargetDomainAsCompetitor()
    {
        var context = CreateInMemoryDbContext();
        var projectId = Guid.NewGuid();
        context.Projects.Add(new Project
        {
            Id = projectId,
            Name = "Test Project",
            PrimaryDomain = "primary.com"
        });
        await context.SaveChangesAsync();

        var validator = new AddCompetitorCommandValidator(context);
        var command = new AddCompetitorCommand(projectId, "Primary Duplicate", "https://www.primary.com", null);

        var result = await validator.TestValidateAsync(command);
        result.ShouldHaveValidationErrorFor("Domain")
            .WithErrorMessage("Competitor domain cannot be the project primary domain.");
    }

    [Fact]
    public async Task AddCompetitorCommand_RejectsDuplicateDomainInSameProject()
    {
        var context = CreateInMemoryDbContext();
        var projectId = Guid.NewGuid();
        context.Projects.Add(new Project
        {
            Id = projectId,
            Name = "Test Project",
            PrimaryDomain = "primary.com"
        });
        context.Competitors.Add(new Competitor
        {
            ProjectId = projectId,
            Name = "Existing Comp",
            Domain = "competitor-a.com"
        });
        await context.SaveChangesAsync();

        var validator = new AddCompetitorCommandValidator(context);
        var command = new AddCompetitorCommand(projectId, "Another Comp", "https://www.competitor-a.com/", null);

        var result = await validator.TestValidateAsync(command);
        result.ShouldHaveValidationErrorFor("Domain")
            .WithErrorMessage("A competitor with this domain already exists in this project.");
    }

    [Fact]
    public async Task AddCompetitorCommandHandler_CreatesCompetitorAndLogsActivity()
    {
        var context = CreateInMemoryDbContext();
        var projectId = Guid.NewGuid();
        context.Projects.Add(new Project
        {
            Id = projectId,
            Name = "Test Project",
            PrimaryDomain = "primary.com"
        });
        await context.SaveChangesAsync();

        var handler = new AddCompetitorCommandHandler(context, _mockActivityLogger.Object, _mockCurrentUser.Object);
        var command = new AddCompetitorCommand(projectId, "Test Comp", "https://www.test-comp.com", "Test Notes");

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal("test-comp.com", response.Data.Domain);
        Assert.Equal("Test Comp", response.Data.Name);

        var saved = await context.Competitors.FirstOrDefaultAsync(c => c.ProjectId == projectId);
        Assert.NotNull(saved);
        Assert.Equal("test-comp.com", saved.Domain);

        _mockActivityLogger.Verify(a => a.LogAsync(
            "Competitor.Added",
            nameof(Competitor),
            saved.Id.ToString(),
            projectId,
            It.IsAny<object>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteCompetitorCommandHandler_DeletesCompetitorAndCascades()
    {
        var context = CreateInMemoryDbContext();
        var projectId = Guid.NewGuid();
        var comp = new Competitor
        {
            ProjectId = projectId,
            Name = "To Delete",
            Domain = "todelete.com"
        };
        context.Competitors.Add(comp);
        await context.SaveChangesAsync();

        var handler = new DeleteCompetitorCommandHandler(context, _mockActivityLogger.Object);
        var response = await handler.Handle(new DeleteCompetitorCommand(projectId, comp.Id), CancellationToken.None);

        Assert.True(response.Success);
        var remaining = await context.Competitors.FirstOrDefaultAsync(c => c.Id == comp.Id);
        Assert.Null(remaining);

        _mockActivityLogger.Verify(a => a.LogAsync(
            "Competitor.Deleted",
            nameof(Competitor),
            comp.Id.ToString(),
            projectId,
            It.IsAny<object>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Provider_TestA_SingleCompetitorMatched_DerivesFromSerpOrganicResult()
    {
        // Keyword -> independent simulated SERP -> matched organic result -> CompetitorRankObservation
        var provider = new DevelopmentRankTrackingProvider();
        var projectId = Guid.NewGuid();
        var kwId = Guid.NewGuid();
        var compId = Guid.NewGuid();
        var compDomain = "competitor-a.com";

        // Generate independent SERP without competitor inputs
        var serp = provider.GenerateSimulatedSerp(kwId, 0);
        serp.Should().HaveCount(100);

        var observations = await provider.GetCompetitorObservationsAsync(
            projectId,
            new[] { kwId },
            new[] { (compId, compDomain) });

        observations.Should().HaveCount(1);
        var obs = observations[0];
        obs.CompetitorId.Should().Be(compId);
        obs.KeywordId.Should().Be(kwId);
        obs.ProjectId.Should().Be(projectId);

        // Find the matched organic result in the independent SERP
        var matchedSerpResult = serp.FirstOrDefault(r => r.Domain == compDomain);
        matchedSerpResult.Should().NotBeNull();
        obs.Position.Should().Be(matchedSerpResult!.Position);
        obs.RankedUrl.Should().Be(matchedSerpResult.Url);
        obs.ProviderName.Should().Be("development");
    }

    [Fact]
    public async Task Provider_TestB_TwoCompetitorsInSameSerp_BothDerivedFromRespectiveSerpResults()
    {
        var provider = new DevelopmentRankTrackingProvider();
        var projectId = Guid.NewGuid();
        var kwId = Guid.NewGuid();
        var compA = (Id: Guid.NewGuid(), Domain: "competitor-a.com");
        var compB = (Id: Guid.NewGuid(), Domain: "competitor-b.com");

        var serp = provider.GenerateSimulatedSerp(kwId, 0);

        var observations = await provider.GetCompetitorObservationsAsync(
            projectId,
            new[] { kwId },
            new[] { compA, compB });

        observations.Should().HaveCount(2);

        var obsA = observations.First(o => o.CompetitorId == compA.Id);
        var obsB = observations.First(o => o.CompetitorId == compB.Id);

        var matchedSerpA = serp.First(r => r.Domain == compA.Domain);
        var matchedSerpB = serp.First(r => r.Domain == compB.Domain);

        obsA.Position.Should().Be(matchedSerpA.Position);
        obsA.RankedUrl.Should().Be(matchedSerpA.Url);

        obsB.Position.Should().Be(matchedSerpB.Position);
        obsB.RankedUrl.Should().Be(matchedSerpB.Url);

        obsA.Position.Should().NotBe(obsB.Position);
    }

    [Fact]
    public async Task Provider_TestC_CompetitorAbsentFromSerp_ReturnsNullPositionAndUrl()
    {
        var provider = new DevelopmentRankTrackingProvider();
        var projectId = Guid.NewGuid();
        var kwId = Guid.NewGuid();
        var absentComp = (Id: Guid.NewGuid(), Domain: "non-existent-competitor-domain-xyz.com");

        var serp = provider.GenerateSimulatedSerp(kwId, 0);
        serp.Any(r => r.Domain == absentComp.Domain).Should().BeFalse("Competitor should not be in top 100");

        var observations = await provider.GetCompetitorObservationsAsync(
            projectId,
            new[] { kwId },
            new[] { absentComp });

        var obs = observations.First(o => o.CompetitorId == absentComp.Id);
        obs.Position.Should().BeNull();
        obs.RankedUrl.Should().BeNull();
        obs.ProviderName.Should().Be("development");
    }

    [Fact]
    public async Task Provider_TestD_RankedUrl_ExactlyCorrespondsToMatchedOrganicResult()
    {
        var provider = new DevelopmentRankTrackingProvider();
        var projectId = Guid.NewGuid();
        var kwId = Guid.NewGuid();
        var comp = (Id: Guid.NewGuid(), Domain: "competitor-a.com");

        var serp = provider.GenerateSimulatedSerp(kwId, 0);
        var matched = serp.First(r => r.Domain == comp.Domain);

        var observations = await provider.GetCompetitorObservationsAsync(
            projectId,
            new[] { kwId },
            new[] { comp });

        observations[0].RankedUrl.Should().Be(matched.Url);
        observations[0].RankedUrl.Should().StartWith($"https://{comp.Domain}/blog/");
    }

    [Fact]
    public async Task Provider_TestE_DomainCollision_ExampleDoesNotMatchNotExample()
    {
        var provider = new TestableSerpProvider(new List<OrganicSerpResult>
        {
            new(1, "https://notexample.com/page-1", "notexample.com", "test"),
            new(2, "https://another-example.com/page-2", "another-example.com", "test"),
            new(3, "https://example.com.org/page-3", "example.com.org", "test")
        });

        var projectId = Guid.NewGuid();
        var kwId = Guid.NewGuid();
        var targetComp = (Id: Guid.NewGuid(), Domain: "example.com");

        var observations = await provider.GetCompetitorObservationsAsync(
            projectId,
            new[] { kwId },
            new[] { targetComp });

        // Since only notexample.com, another-example.com, and example.com.org exist in SERP, example.com must NOT match!
        observations.Should().HaveCount(1);
        observations[0].Position.Should().BeNull();
        observations[0].RankedUrl.Should().BeNull();
    }

    [Fact]
    public async Task Provider_TestF_PositionBoundaries_ValidPositionsOnly1To100()
    {
        var provider = new DevelopmentRankTrackingProvider();
        var projectId = Guid.NewGuid();
        var kwIds = Enumerable.Range(0, 10).Select(_ => Guid.NewGuid()).ToList();
        var compList = new[]
        {
            (Id: Guid.NewGuid(), Domain: "alpharival.com"),
            (Id: Guid.NewGuid(), Domain: "competitor-a.com"),
            (Id: Guid.NewGuid(), Domain: "competitor-b.com")
        };

        var observations = await provider.GetCompetitorObservationsAsync(
            projectId,
            kwIds,
            compList);

        observations.Should().NotBeEmpty();
        foreach (var obs in observations)
        {
            if (obs.Position.HasValue)
            {
                obs.Position.Value.Should().BeInRange(1, 100);
            }
        }
    }

    [Fact]
    public async Task Provider_TestG_DifferentSerpOrdering_ObservationPositionChangesWithMatchedSerpResult()
    {
        // Prove that changing the simulated SERP ordering changes the competitor position,
        // proving position comes from the matched result, not from competitor index or ID.
        var compId = Guid.NewGuid();
        var comp = (Id: compId, Domain: "changing-rank.com");
        var projectId = Guid.NewGuid();
        var kwId = Guid.NewGuid();

        // SERP 1: competitor is at position 4
        var serp1 = new List<OrganicSerpResult>
        {
            new(1, "https://leader.com/page", "leader.com", "test"),
            new(4, "https://changing-rank.com/page-a", "changing-rank.com", "test"),
            new(12, "https://third.com/page", "third.com", "test")
        };
        var provider1 = new TestableSerpProvider(serp1);
        var obs1 = await provider1.GetCompetitorObservationsAsync(projectId, new[] { kwId }, new[] { comp });

        // SERP 2: SAME competitor is at position 12
        var serp2 = new List<OrganicSerpResult>
        {
            new(1, "https://leader.com/page", "leader.com", "test"),
            new(4, "https://other.com/page", "other.com", "test"),
            new(12, "https://changing-rank.com/page-b", "changing-rank.com", "test")
        };
        var provider2 = new TestableSerpProvider(serp2);
        var obs2 = await provider2.GetCompetitorObservationsAsync(projectId, new[] { kwId }, new[] { comp });

        // Assert
        obs1[0].Position.Should().Be(4);
        obs1[0].RankedUrl.Should().Be("https://changing-rank.com/page-a");

        obs2[0].Position.Should().Be(12);
        obs2[0].RankedUrl.Should().Be("https://changing-rank.com/page-b");
    }

    private class TestableSerpProvider : DevelopmentRankTrackingProvider
    {
        private readonly IReadOnlyList<OrganicSerpResult> _customSerp;

        public TestableSerpProvider(IReadOnlyList<OrganicSerpResult> customSerp)
        {
            _customSerp = customSerp;
        }

        public override IReadOnlyList<OrganicSerpResult> GenerateSimulatedSerp(
            Guid keywordId,
            int kwIndex)
        {
            return _customSerp;
        }
    }

    [Fact]
    public async Task GetCompetitorOverview_CalculatesBucketsAndTop20OverlapCorrectly()
    {
        var context = CreateInMemoryDbContext();
        var projectId = Guid.NewGuid();
        var project = new Project
        {
            Id = projectId,
            Name = "Test Project",
            PrimaryDomain = "target.com",
            CreatedBy = Guid.NewGuid()
        };
        context.Projects.Add(project);

        var competitor = new Competitor
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Name = "Competitor Alpha",
            Domain = "alpha.com",
            CreatedBy = Guid.NewGuid()
        };
        context.Competitors.Add(competitor);

        // 5 keywords total
        var kwIds = Enumerable.Range(0, 5).Select(_ => Guid.NewGuid()).ToList();
        foreach (var kwId in kwIds)
        {
            context.Keywords.Add(new Keyword
            {
                Id = kwId,
                ProjectId = projectId,
                KeywordText = $"keyword-{kwId}",
                IsActive = true,
                CreatedBy = Guid.NewGuid()
            });
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Target ranks:
        // kw 0: Pos 2 (Top 3, Top 10, Top 20, Top 100)
        // kw 1: Pos 8 (Top 10, Top 20, Top 100)
        // kw 2: Pos 15 (Top 20, Top 100)
        // kw 3: Pos 45 (Top 100)
        // kw 4: unranked (>100 or null)
        context.RankResults.AddRange(
            new RankResult { KeywordId = kwIds[0], ProjectId = projectId, CheckDate = today, Position = 2 },
            new RankResult { KeywordId = kwIds[1], ProjectId = projectId, CheckDate = today, Position = 8 },
            new RankResult { KeywordId = kwIds[2], ProjectId = projectId, CheckDate = today, Position = 15 },
            new RankResult { KeywordId = kwIds[3], ProjectId = projectId, CheckDate = today, Position = 45 },
            new RankResult { KeywordId = kwIds[4], ProjectId = projectId, CheckDate = today, Position = null }
        );

        // Competitor Alpha ranks:
        // kw 0: Pos 1 (Top 3, Top 10, Top 20) -> OVERLAP with Target (Target is 2, <= 20)
        // kw 1: Pos 12 (Top 20) -> OVERLAP with Target (Target is 8, <= 20)
        // kw 2: Pos 35 (Top 100, not in Top 20) -> NO overlap
        // kw 3: Pos 5 (Top 10, Top 20) -> Target is 45 (not <= 20) -> NO overlap
        // kw 4: Pos null -> NO overlap
        context.CompetitorRankResults.AddRange(
            new CompetitorRankResult { KeywordId = kwIds[0], CompetitorId = competitor.Id, ProjectId = projectId, CheckDate = today, Position = 1 },
            new CompetitorRankResult { KeywordId = kwIds[1], CompetitorId = competitor.Id, ProjectId = projectId, CheckDate = today, Position = 12 },
            new CompetitorRankResult { KeywordId = kwIds[2], CompetitorId = competitor.Id, ProjectId = projectId, CheckDate = today, Position = 35 },
            new CompetitorRankResult { KeywordId = kwIds[3], CompetitorId = competitor.Id, ProjectId = projectId, CheckDate = today, Position = 5 },
            new CompetitorRankResult { KeywordId = kwIds[4], CompetitorId = competitor.Id, ProjectId = projectId, CheckDate = today, Position = null }
        );

        await context.SaveChangesAsync();

        var handler = new GetCompetitorOverviewQueryHandler(context);
        var result = await handler.Handle(new GetCompetitorOverviewQuery(projectId, 30), CancellationToken.None);

        result.Success.Should().BeTrue();
        var data = result.Data!;
        data.TotalKeywordsCount.Should().Be(5);
        data.Summaries.Should().HaveCount(2);

        // Check Target Domain
        var targetSummary = data.Summaries.First(s => s.IsTargetDomain);
        targetSummary.Top3Count.Should().Be(1);
        targetSummary.Top10Count.Should().Be(2);
        targetSummary.Top20Count.Should().Be(3);
        targetSummary.Top100Count.Should().Be(4);
        targetSummary.UnrankedCount.Should().Be(1); // 5 total - 4 ranked in Top 100 = 1
        targetSummary.Top20OverlapCount.Should().Be(3); // target has 3 keywords in Top 20
        targetSummary.Top20OverlapPercentage.Should().Be(60.0m); // 3 / 5 * 100 = 60.0%

        // Check Competitor Alpha
        var compSummary = data.Summaries.First(s => !s.IsTargetDomain);
        compSummary.Top3Count.Should().Be(1);
        compSummary.Top10Count.Should().Be(2);
        compSummary.Top20Count.Should().Be(3);
        compSummary.Top100Count.Should().Be(4);
        compSummary.UnrankedCount.Should().Be(1);
        // Overlap: kw 0 and kw 1 both rank in Top 20 for target AND competitor!
        compSummary.Top20OverlapCount.Should().Be(2);
        compSummary.Top20OverlapPercentage.Should().Be(40.0m); // 2 / 5 * 100 = 40.0%
    }
}

