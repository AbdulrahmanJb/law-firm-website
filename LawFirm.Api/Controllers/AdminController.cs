using LawFirm.Api.Filters;
using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Api.Controllers;

[ApiController]
[AdminToken]
[Route("api/admin")]
public class AdminController(LawFirmDbContext dbContext) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var response = new
        {
            todayVisits = await dbContext.DailyVisits
                .Where(visit => visit.VisitDate == today)
                .SumAsync(visit => visit.Count),
            totalVisits = await dbContext.DailyVisits.SumAsync(visit => visit.Count),
            consultations = await dbContext.ConsultationRequests.CountAsync(),
            pendingConsultations = await dbContext.ConsultationRequests.CountAsync(item => !item.IsReviewed),
            blogs = await dbContext.BlogPosts.CountAsync(),
            videos = await dbContext.Videos.CountAsync()
        };

        return Ok(response);
    }

    [HttpGet("visits/daily")]
    public async Task<IActionResult> DailyVisits()
    {
        var visits = await dbContext.DailyVisits
            .OrderByDescending(visit => visit.VisitDate)
            .ThenBy(visit => visit.PagePath)
            .Take(60)
            .ToListAsync();

        return Ok(visits);
    }

    [HttpGet("consultations")]
    public async Task<IActionResult> Consultations()
    {
        return Ok(await dbContext.ConsultationRequests
            .OrderByDescending(item => item.CreatedAtUtc)
            .ToListAsync());
    }

    [HttpPost("blogs")]
    public async Task<IActionResult> CreateBlog(BlogPost post)
    {
        post.Id = 0;
        post.PublishedAtUtc = DateTime.UtcNow;
        dbContext.BlogPosts.Add(post);
        await dbContext.SaveChangesAsync();
        return Ok(post);
    }

    [HttpDelete("blogs/{id:int}")]
    public async Task<IActionResult> DeleteBlog(int id)
    {
        var post = await dbContext.BlogPosts.FindAsync(id);
        if (post is null) return NotFound();

        dbContext.BlogPosts.Remove(post);
        await dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("videos")]
    public async Task<IActionResult> CreateVideo(VideoItem video)
    {
        video.Id = 0;
        video.PublishedAtUtc = DateTime.UtcNow;
        dbContext.Videos.Add(video);
        await dbContext.SaveChangesAsync();
        return Ok(video);
    }

    [HttpDelete("videos/{id:int}")]
    public async Task<IActionResult> DeleteVideo(int id)
    {
        var video = await dbContext.Videos.FindAsync(id);
        if (video is null) return NotFound();

        dbContext.Videos.Remove(video);
        await dbContext.SaveChangesAsync();
        return NoContent();
    }
}
