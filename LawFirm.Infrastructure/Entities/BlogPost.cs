namespace LawFirm.Infrastructure.Entities;

public class BlogPost
{
    public int Id { get; set; }
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string ExcerptAr { get; set; } = string.Empty;
    public string ExcerptEn { get; set; } = string.Empty;
    public string ContentAr { get; set; } = string.Empty;
    public string ContentEn { get; set; } = string.Empty;
    public DateTime PublishedAtUtc { get; set; } = DateTime.UtcNow;
    public bool IsPublished { get; set; } = true;
}
