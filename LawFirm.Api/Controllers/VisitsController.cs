using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/visits")]
public class VisitsController(LawFirmDbContext dbContext) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Track(TrackVisitRequest request)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var pagePath = string.IsNullOrWhiteSpace(request.PagePath) ? "/" : request.PagePath.Trim();

        var dailyVisit = await dbContext.DailyVisits
            .SingleOrDefaultAsync(visit => visit.VisitDate == today && visit.PagePath == pagePath);

        if (dailyVisit is null)
        {
            dailyVisit = new DailyVisit { VisitDate = today, PagePath = pagePath, Count = 1 };
            dbContext.DailyVisits.Add(dailyVisit);
        }
        else
        {
            dailyVisit.Count++;
        }

        await dbContext.SaveChangesAsync();
        return NoContent();
    }
}

public record TrackVisitRequest(string PagePath);
