using LawFirm.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Infrastructure.Data;

public class LawFirmDbContext(DbContextOptions<LawFirmDbContext> options) : DbContext(options)
{
    public DbSet<ServiceItem> Services => Set<ServiceItem>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<VideoItem> Videos => Set<VideoItem>();
    public DbSet<ConsultationRequest> ConsultationRequests => Set<ConsultationRequest>();
    public DbSet<DailyVisit> DailyVisits => Set<DailyVisit>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DailyVisit>()
            .HasIndex(visit => new { visit.VisitDate, visit.PagePath })
            .IsUnique();

        modelBuilder.Entity<ServiceItem>().HasData(
            new ServiceItem
            {
                Id = 1,
                TitleAr = "الاستشارات القانونية",
                TitleEn = "Legal Consultations",
                DescriptionAr = "استشارات قانونية واضحة للأفراد والشركات.",
                DescriptionEn = "Clear legal consultations for individuals and companies.",
                DisplayOrder = 1
            },
            new ServiceItem
            {
                Id = 2,
                TitleAr = "القضايا التجارية",
                TitleEn = "Commercial Cases",
                DescriptionAr = "تمثيل قانوني في النزاعات والعقود التجارية.",
                DescriptionEn = "Legal representation for commercial disputes and contracts.",
                DisplayOrder = 2
            },
            new ServiceItem
            {
                Id = 3,
                TitleAr = "صياغة العقود",
                TitleEn = "Contract Drafting",
                DescriptionAr = "صياغة ومراجعة العقود بما يحمي المصالح القانونية.",
                DescriptionEn = "Drafting and reviewing contracts to protect legal interests.",
                DisplayOrder = 3
            });

        modelBuilder.Entity<BlogPost>().HasData(new BlogPost
        {
            Id = 1,
            TitleAr = "متى تحتاج إلى استشارة قانونية؟",
            TitleEn = "When do you need a legal consultation?",
            ExcerptAr = "دليل مختصر يساعدك على معرفة الوقت المناسب لطلب المشورة القانونية.",
            ExcerptEn = "A short guide for knowing when to seek legal advice.",
            ContentAr = "ابدأ بطلب الاستشارة عند وجود عقد مهم أو نزاع أو مطالبة مالية.",
            ContentEn = "Start with a consultation when you have an important contract, dispute, or claim.",
            PublishedAtUtc = new DateTime(2026, 1, 1, 9, 0, 0, DateTimeKind.Utc)
        });

        modelBuilder.Entity<VideoItem>().HasData(new VideoItem
        {
            Id = 1,
            TitleAr = "تعريف بالخدمات القانونية",
            TitleEn = "Legal services overview",
            DescriptionAr = "فيديو تعريفي قصير يمكن استبداله من لوحة التحكم.",
            DescriptionEn = "A short intro video that can be replaced from the dashboard.",
            VideoUrl = "https://www.youtube.com/",
            PublishedAtUtc = new DateTime(2026, 1, 1, 9, 0, 0, DateTimeKind.Utc)
        });
    }
}
