using LawFirm.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<LawFirmDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularClient", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200", "http://127.0.0.1:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<LawFirmDbContext>();
    dbContext.Database.EnsureCreated();

    var placeholderVideos = dbContext.Videos
        .Where(video => video.VideoUrl == "https://www.youtube.com/" || video.VideoUrl == "https://youtube.com/")
        .ToList();

    if (placeholderVideos.Count > 0)
    {
        dbContext.Videos.RemoveRange(placeholderVideos);
    }

    var defaultVideos = new[]
    {
        new { TitleAr = "وش يهم القاضي في الاعتراض؟ خمسة أسرار لازم تعرفها عند محكمة الاستئناف.", TitleEn = "What matters to the judge in an appeal? Five things to know before the Court of Appeal.", VideoUrl = "https://www.youtube.com/watch?v=rg5B1ty6XVM" },
        new { TitleAr = "متى تعتبر المحكمة الدعوى “كيدية” وتُعزر صاحبها؟", TitleEn = "When does the court consider a lawsuit malicious and penalize its filer?", VideoUrl = "https://www.youtube.com/watch?v=s1BJItsZW5s" },
        new { TitleAr = "انتبه تسوي هالشيء في القضية الجزائية ..!", TitleEn = "Do not do this in a criminal case.", VideoUrl = "https://www.youtube.com/watch?v=WNpuOs8dpVM" },
        new { TitleAr = "وش الفرق بين الشيك والكمبيالة والسند لأمر؟ لا توقع قبل ما تفهم!", TitleEn = "What is the difference between a cheque, bill of exchange, and promissory note?", VideoUrl = "https://www.youtube.com/watch?v=_8DCHXqL5SE" },
        new { TitleAr = "كيف تطالب بالتعويض عن الضرر المعنوي.", TitleEn = "How to claim compensation for moral damage.", VideoUrl = "https://www.youtube.com/watch?v=MbEIM-Sf2Ag" },
        new { TitleAr = "متى يكون حضور المتهم والمدعي العام واجب؟ أمام المحكمة الجزائية .. !", TitleEn = "When is the attendance of the accused and public prosecutor required before the criminal court?", VideoUrl = "https://www.youtube.com/watch?v=MTdqLAKv9GE" }
    };

    var existingVideos = dbContext.Videos.ToList();

    for (var index = 0; index < defaultVideos.Length; index++)
    {
        var defaultVideo = defaultVideos[index];
        var existingVideo = existingVideos.FirstOrDefault(video =>
            string.Equals(video.VideoUrl, defaultVideo.VideoUrl, StringComparison.OrdinalIgnoreCase));

        if (existingVideo is not null)
        {
            existingVideo.TitleAr = defaultVideo.TitleAr;
            existingVideo.TitleEn = defaultVideo.TitleEn;
            existingVideo.DescriptionAr = "مقطع من قناة المكتب على يوتيوب ضمن المكتبة المرئية.";
            existingVideo.DescriptionEn = "A video from the office YouTube channel in the video library.";
            existingVideo.IsPublished = true;
            continue;
        }

        var number = index + 1;
        dbContext.Videos.Add(new()
        {
            TitleAr = defaultVideo.TitleAr,
            TitleEn = defaultVideo.TitleEn,
            DescriptionAr = "مقطع من قناة المكتب على يوتيوب ضمن المكتبة المرئية.",
            DescriptionEn = "A video from the office YouTube channel in the video library.",
            VideoUrl = defaultVideo.VideoUrl,
            IsPublished = true,
            PublishedAtUtc = new DateTime(2026, 5, 7, 9, number, 0, DateTimeKind.Utc)
        });
    }

    dbContext.SaveChanges();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AngularClient");
app.UseAuthorization();
app.MapControllers();

app.Run();
