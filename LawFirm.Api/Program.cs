using LawFirm.Infrastructure.Data;
using LawFirm.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSingleton<AdminJwtService>();
builder.Services.AddDbContext<LawFirmDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularClient", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? ["http://localhost:4200", "https://localhost:4200", "http://127.0.0.1:4200"];

        policy.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<LawFirmDbContext>();
    dbContext.Database.EnsureCreated();
    dbContext.Database.ExecuteSqlRaw("""
        IF COL_LENGTH('ConsultationRequests', 'ServiceType') IS NULL
        BEGIN
            ALTER TABLE ConsultationRequests ADD ServiceType nvarchar(max) NOT NULL CONSTRAINT DF_ConsultationRequests_ServiceType DEFAULT N'طلب استشارة'
        END
        """);
    dbContext.Database.ExecuteSqlRaw("""
        IF COL_LENGTH('ConsultationRequests', 'IsReviewed') IS NULL
        BEGIN
            ALTER TABLE ConsultationRequests ADD IsReviewed bit NOT NULL CONSTRAINT DF_ConsultationRequests_IsReviewed DEFAULT CAST(0 AS bit)
        END
        """);

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

    var defaultBlogs = new[]
    {
        new
        {
            TitleAr = "متى تحتاج إلى استشارة قانونية؟",
            TitleEn = "When do you need a legal consultation?",
            ExcerptAr = "الاستشارة القانونية المبكرة تساعدك على فهم موقفك قبل توقيع عقد، أو بدء مطالبة، أو الدخول في نزاع.",
            ExcerptEn = "Early legal advice helps you understand your position before signing, claiming, or entering a dispute.",
            ContentAr = "تكون الاستشارة القانونية مهمة عندما يكون القرار مرتبطا بحقوق مالية، أو التزامات تعاقدية، أو نزاع قائم أو محتمل. طلب المشورة في وقت مبكر يمنحك صورة أوضح عن المخاطر والخيارات والإجراءات المناسبة، ويقلل احتمال اتخاذ قرار غير مدروس قد يصعب تصحيحه لاحقا.",
            ContentEn = "A legal consultation is important when a decision affects financial rights, contractual obligations, or an existing or potential dispute. Getting advice early clarifies risks, options, and the correct procedure before the issue becomes harder to fix."
        },
        new
        {
            TitleAr = "قبل توقيع العقد: نقاط لا تتجاهلها",
            TitleEn = "Before signing a contract: points not to ignore",
            ExcerptAr = "العقد الجيد لا يوضح الالتزامات فقط، بل يحمي الأطراف عند الخلاف ويقلل مساحة التفسير.",
            ExcerptEn = "A good contract does more than list obligations; it protects the parties when disagreement happens.",
            ContentAr = "قبل توقيع أي عقد، راجع نطاق الالتزامات، مدة العقد، آلية السداد، حالات الإنهاء، الاختصاص القضائي، والغرامات أو التعويضات. الصياغة الواضحة تمنع الخلاف حول المقصود، وتساعد كل طرف على معرفة حقوقه وواجباته قبل بداية العلاقة التعاقدية.",
            ContentEn = "Before signing, review the scope of obligations, term, payment mechanism, termination rights, jurisdiction, penalties, and compensation clauses. Clear drafting prevents disputes over meaning and helps each party understand its rights and duties from the start."
        },
        new
        {
            TitleAr = "كيف تحفظ حقك في النزاع العمالي؟",
            TitleEn = "How to protect your rights in a labor dispute",
            ExcerptAr = "الاحتفاظ بالمستندات والمراسلات وفهم المدد النظامية عناصر أساسية في أي مطالبة عمالية.",
            ExcerptEn = "Keeping documents, communications, and deadline awareness is essential in labor claims.",
            ContentAr = "في النزاعات العمالية، تبدأ حماية الحق من تنظيم المستندات: عقد العمل، الرواتب، الإنذارات، المراسلات، وسجل الحضور أو الإنجاز. كما يجب الانتباه إلى المدد والإجراءات النظامية، لأن قوة المطالبة لا تعتمد على الحق فقط، بل على طريقة إثباته وتقديمه.",
            ContentEn = "In labor disputes, protecting your rights starts with organizing documents: the employment contract, salary records, warnings, correspondence, and attendance or performance records. The strength of a claim depends not only on the right itself, but also on how it is proven and presented."
        },
        new
        {
            TitleAr = "الفرق بين الشيك والكمبيالة والسند لأمر",
            TitleEn = "The difference between a cheque, bill of exchange, and promissory note",
            ExcerptAr = "كل ورقة تجارية لها طبيعة قانونية مختلفة، وفهم الفرق يساعدك قبل التوقيع أو المطالبة.",
            ExcerptEn = "Each commercial paper has a different legal nature, and knowing the difference matters before signing.",
            ContentAr = "الشيك أداة وفاء غالبا، أما الكمبيالة والسند لأمر فيرتبطان بالتزام مكتوب وفق شروط محددة. قبل التوقيع على أي ورقة تجارية، يجب فهم أطرافها، تاريخ الاستحقاق، قيمة الالتزام، وآثار التخلف عن السداد، لأن الخطأ في التعامل معها قد ينتج عنه التزام تنفيذي مباشر.",
            ContentEn = "A cheque is commonly a payment instrument, while bills of exchange and promissory notes create written obligations under specific requirements. Before signing commercial paper, understand the parties, maturity date, amount, and consequences of non-payment."
        },
        new
        {
            TitleAr = "خطوات تسجيل العلامة التجارية وحمايتها",
            TitleEn = "Steps to register and protect a trademark",
            ExcerptAr = "العلامة التجارية أصل مهم للمنشأة، وحمايتها تبدأ من البحث والتسجيل والمتابعة.",
            ExcerptEn = "A trademark is a valuable business asset; protection starts with search, registration, and monitoring.",
            ContentAr = "تسجيل العلامة التجارية يبدأ بالتحقق من تميز العلامة وعدم تعارضها مع علامات قائمة، ثم تقديم الطلب ومتابعة الفحص والنشر والاعتراضات إن وجدت. بعد التسجيل، تحتاج العلامة إلى متابعة الاستخدام وحماية الحقوق ضد التقليد أو الاستخدام غير المصرح به.",
            ContentEn = "Trademark registration begins with checking distinctiveness and potential conflicts, then filing the application and following examination, publication, and objections if any. After registration, the mark should be monitored and protected against imitation or unauthorized use."
        },
        new
        {
            TitleAr = "ماذا تفعل قبل رفع دعوى؟",
            TitleEn = "What should you do before filing a lawsuit?",
            ExcerptAr = "الاستعداد قبل رفع الدعوى يختصر الوقت ويقوي موقفك أمام الجهة المختصة.",
            ExcerptEn = "Preparation before filing saves time and strengthens your position before the competent authority.",
            ContentAr = "قبل رفع الدعوى، حدد الطلبات بدقة، واجمع الأدلة، وراجع الاختصاص، وقيّم فرص التسوية. كما يجب ترتيب الوقائع زمنيا وتحديد المستندات المؤيدة لكل واقعة، لأن وضوح الملف منذ البداية يساعد على عرض النزاع بصورة أقوى وأكثر تنظيما.",
            ContentEn = "Before filing a lawsuit, define the claims clearly, collect evidence, confirm jurisdiction, and evaluate settlement opportunities. Arrange events chronologically and connect each fact to supporting documents so the dispute is presented clearly from the start."
        }
    };

    var existingBlogs = dbContext.BlogPosts.ToList();

    for (var index = 0; index < defaultBlogs.Length; index++)
    {
        var defaultBlog = defaultBlogs[index];
        var existingBlog = existingBlogs.FirstOrDefault(blog =>
            string.Equals(blog.TitleEn, defaultBlog.TitleEn, StringComparison.OrdinalIgnoreCase));

        if (existingBlog is not null)
        {
            existingBlog.TitleAr = defaultBlog.TitleAr;
            existingBlog.ExcerptAr = defaultBlog.ExcerptAr;
            existingBlog.ExcerptEn = defaultBlog.ExcerptEn;
            existingBlog.ContentAr = defaultBlog.ContentAr;
            existingBlog.ContentEn = defaultBlog.ContentEn;
            existingBlog.IsPublished = true;
            continue;
        }

        var number = index + 1;
        dbContext.BlogPosts.Add(new()
        {
            TitleAr = defaultBlog.TitleAr,
            TitleEn = defaultBlog.TitleEn,
            ExcerptAr = defaultBlog.ExcerptAr,
            ExcerptEn = defaultBlog.ExcerptEn,
            ContentAr = defaultBlog.ContentAr,
            ContentEn = defaultBlog.ContentEn,
            IsPublished = true,
            PublishedAtUtc = new DateTime(2026, 5, 7, 10, number, 0, DateTimeKind.Utc)
        });
    }

    dbContext.SaveChanges();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AngularClient");
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
