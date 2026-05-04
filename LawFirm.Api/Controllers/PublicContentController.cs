using LawFirm.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/public")]
public class PublicContentController(LawFirmDbContext dbContext) : ControllerBase
{
    [HttpGet("services")]
    public async Task<IActionResult> GetServices()
    {
        var services = await dbContext.Services
            .Where(service => service.IsPublished)
            .OrderBy(service => service.DisplayOrder)
            .ToListAsync();

        return Ok(services);
    }

    [HttpGet("blogs")]
    public async Task<IActionResult> GetBlogs()
    {
        var posts = await dbContext.BlogPosts
            .Where(post => post.IsPublished)
            .OrderByDescending(post => post.PublishedAtUtc)
            .ToListAsync();

        return Ok(posts);
    }

    [HttpGet("videos")]
    public async Task<IActionResult> GetVideos()
    {
        var videos = await dbContext.Videos
            .Where(video => video.IsPublished)
            .OrderByDescending(video => video.PublishedAtUtc)
            .ToListAsync();

        return Ok(videos);
    }
}
