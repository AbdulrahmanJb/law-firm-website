namespace LawFirm.Infrastructure.Entities;

public class VideoItem
{
    public int Id { get; set; }
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string VideoUrl { get; set; } = string.Empty;
    public DateTime PublishedAtUtc { get; set; } = DateTime.UtcNow;
    public bool IsPublished { get; set; } = true;
}
