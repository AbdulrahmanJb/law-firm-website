import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../environments/environment';

type Language = 'ar' | 'en';
type Page = 'home' | 'services' | 'blogs' | 'videos' | 'admin';

interface LocalizedItem {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  excerptAr?: string;
  excerptEn?: string;
  contentAr?: string;
  contentEn?: string;
  videoUrl?: string;
  publishedAtUtc?: string;
  isPublished?: boolean;
}

interface LegalService {
  titleAr: string;
  titleEn: string;
  icon: string;
  summaryAr: string;
  summaryEn: string;
  pointsAr: string[];
  pointsEn: string[];
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterLink, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly apiUrl = environment.apiUrl;
  private heroTimer?: ReturnType<typeof setInterval>;

  language = signal<Language>('ar');
  page = signal<Page>('home');
  heroSlide = signal(0);
  openServiceIndex = signal(0);
  selectedBlogId = signal<number | null>(null);
  mobileMenuOpen = signal(false);
  services: LocalizedItem[] = [];
  legalServices: LegalService[] = [
    {
      titleAr: 'الاستشارات القانونية',
      titleEn: 'Legal Consultations',
      icon: '💬',
      summaryAr: 'نقدم استشارات قانونية عملية تساعد العميل على فهم موقفه النظامي، وتقييم الخيارات المتاحة، واتخاذ القرار المناسب قبل الدخول في التزامات أو نزاعات.',
      summaryEn: 'Practical legal consultations that clarify legal positions, available options, and the right course of action before commitments or disputes.',
      pointsAr: ['صياغة ومراجعة العقود', 'نقل التكنولوجيا', 'مواءمة الالتزامات مع الأنظمة والشريعة', 'مذكرات التفاهم', 'دعم التفاوض وإدارة الاجتماعات التعاقدية'],
      pointsEn: ['Drafting and reviewing contracts', 'Technology transfer', 'Aligning obligations with law and Sharia', 'Memorandums of understanding', 'Negotiation and contractual meeting support']
    },
    {
      titleAr: 'العقود والاتفاقيات',
      titleEn: 'Contracts and Agreements',
      icon: '✍',
      summaryAr: 'نعتني ببناء العقود والاتفاقيات من مرحلة الفكرة حتى التوقيع، مع صياغة واضحة تحفظ مصالح الأطراف وتقلل المخاطر المستقبلية.',
      summaryEn: 'We structure contracts and agreements from concept to signing with clear drafting that protects interests and reduces future risk.',
      pointsAr: ['صياغة ومراجعة العقود', 'نقل التكنولوجيا', 'مواءمة الالتزامات مع الأنظمة والشريعة', 'مذكرات التفاهم', 'دعم التفاوض وإدارة الاجتماعات التعاقدية'],
      pointsEn: ['Drafting and reviewing contracts', 'Technology transfer', 'Aligning obligations with law and Sharia', 'Memorandums of understanding', 'Negotiation and contractual meeting support']
    },
    {
      titleAr: 'الشؤون العمالية',
      titleEn: 'Labor Affairs',
      icon: '👥',
      summaryAr: 'نساعد المنشآت في تنظيم علاقاتها العمالية بشكل نظامي، بدءا من اللوائح والعقود وحتى تمثيلها في النزاعات أمام الجهات المختصة.',
      summaryEn: 'We help organizations manage labor relationships lawfully, from internal policies and employment contracts to dispute representation.',
      pointsAr: ['لوائح داخلية متوافقة مع المتطلبات النظامية', 'عقود عمل مخصصة لطبيعة كل منشأة', 'تمثيل نزاعات العمل أمام الجهات المختصة'],
      pointsEn: ['Internal policies aligned with legal requirements', 'Employment contracts tailored to each organization', 'Representation in labor disputes']
    },
    {
      titleAr: 'المشاريع والامتياز التجاري',
      titleEn: 'Projects and Franchising',
      icon: '🏗',
      summaryAr: 'نقدم دعما قانونيا للمشاريع الكبرى وعلاقات المقاولين والموردين، مع بناء صيغ تعاقدية وهيكلية قانونية تحمي الأطراف وتدعم التنفيذ.',
      summaryEn: 'Legal support for major projects, subcontractor and supplier relationships, and franchise structures that protect parties and support delivery.',
      pointsAr: ['عقود مشاريع', 'علاقات مقاولي الباطن والموردين', 'هيكلة قانونية متكاملة', 'صيغ امتياز تجاري', 'حماية مصالح الأطراف في المشاريع الكبرى'],
      pointsEn: ['Project contracts', 'Subcontractor and supplier relationships', 'Integrated legal structuring', 'Franchise formats', 'Protecting parties in major projects']
    },
    {
      titleAr: 'الملكية الفكرية',
      titleEn: 'Intellectual Property',
      icon: '®',
      summaryAr: 'نحمي الأصول غير الملموسة للعميل من خلال تسجيل الحقوق ومتابعة التعديات وتمثيله في المنازعات المرتبطة بالملكية الفكرية.',
      summaryEn: 'Protection for intangible assets through registration, infringement handling, and representation in intellectual property disputes.',
      pointsAr: ['تسجيل العلامات التجارية والنماذج الصناعية', 'حماية الحقوق رقميا وتقليديا', 'التمثيل في منازعات التعدي والاعتداء على الملكية الفكرية'],
      pointsEn: ['Trademark and industrial design registration', 'Digital and traditional rights protection', 'Representation in IP infringement disputes']
    },
    {
      titleAr: 'النزاعات الجمركية',
      titleEn: 'Customs Disputes',
      icon: '▦',
      summaryAr: 'ندعم العملاء في التعامل مع الاعتراضات الجمركية واسترداد الرسوم وبناء سياسات امتثال تقلل فرص نشوء النزاعات مستقبلا.',
      summaryEn: 'Support for customs objections, duty refunds, and compliance policies that reduce future disputes.',
      pointsAr: ['اعتراضات واستئنافات أمام الجهات الجمركية', 'استرداد الرسوم الجمركية', 'هندسة سياسات الامتثال للحد من النزاعات المستقبلية'],
      pointsEn: ['Objections and appeals before customs authorities', 'Customs duty refunds', 'Compliance policies to reduce future disputes']
    },
    {
      titleAr: 'الاستثمار الأجنبي',
      titleEn: 'Foreign Investment',
      icon: '↗',
      summaryAr: 'نقدم إرشادا قانونيا للمستثمر الأجنبي في هيكلة الاستثمار والحصول على التراخيص واستيفاء المتطلبات النظامية داخل المملكة.',
      summaryEn: 'Legal guidance for foreign investors in structuring investments, licensing, and meeting Saudi regulatory requirements.',
      pointsAr: ['هيكلة الاستثمارات', 'حماية حقوق المستثمر الأجنبي', 'تراخيص واستيفاء متطلبات الجهات المختصة'],
      pointsEn: ['Investment structuring', 'Protecting foreign investor rights', 'Licensing and authority requirements']
    },
    {
      titleAr: 'التقاضي وتسوية المنازعات',
      titleEn: 'Litigation and Dispute Resolution',
      icon: '⚖',
      summaryAr: 'نمثل العملاء في التقاضي والتحكيم والتسويات، مع إعداد المذكرات والاعتراضات وإدارة مسارات الحل قبل الخصومة وأثناءها.',
      summaryEn: 'Representation in litigation, arbitration, and settlements, with memoranda, objections, and dispute strategy before and during proceedings.',
      pointsAr: ['إعداد مذكرات ولوائح واعتراضات', 'إدارة التفاوض والتسويات قبل الخصومة وأثناءها', 'التمثيل أمام التحكيم والوسائل البديلة لتسوية النزاعات'],
      pointsEn: ['Preparing memoranda, pleadings, and objections', 'Managing negotiation and settlements before and during disputes', 'Representation in arbitration and alternative dispute resolution']
    },
    {
      titleAr: 'الدراسات واللوائح والأبحاث',
      titleEn: 'Studies, Regulations, and Research',
      icon: '▤',
      summaryAr: 'نعد الدراسات واللوائح والأبحاث القانونية التي تساعد المنشآت والجهات على بناء قرارات وسياسات متوافقة وقابلة للتطبيق.',
      summaryEn: 'Legal studies, policies, and research that help organizations build compliant and practical decisions and procedures.',
      pointsAr: ['إعداد اللوائح والقرارات الداخلية والتنظيمية', 'مرئيات تشريعية واستشارات لصياغة أو تعديل الأنظمة', 'دراسات الأثر التنظيمي (RIA) وأوراق السياسات', 'أبحاث مقارنة ومصفوفات امتثال', 'أدلة إجرائية ونماذج ومراجعة شاملة للعقود والسياسات'],
      pointsEn: ['Internal and regulatory policies and decisions', 'Legislative views and drafting consultations', 'Regulatory Impact Assessments (RIA) and policy papers', 'Comparative research and compliance matrices', 'Procedural guides, templates, and comprehensive policy and contract reviews']
    }
  ];
  blogs: LocalizedItem[] = [];
  private readonly defaultVideos: LocalizedItem[] = [
    {
      id: 1,
      titleAr: 'وش يهم القاضي في الاعتراض؟ خمسة أسرار لازم تعرفها عند محكمة الاستئناف.',
      titleEn: 'What matters to the judge in an appeal? Five things to know before the Court of Appeal.',
      descriptionAr: 'مقطع من قناة المكتب على يوتيوب ضمن المكتبة المرئية.',
      descriptionEn: 'A video from the office YouTube channel in the video library.',
      videoUrl: 'https://www.youtube.com/watch?v=rg5B1ty6XVM'
    },
    {
      id: 2,
      titleAr: 'متى تعتبر المحكمة الدعوى “كيدية” وتُعزر صاحبها؟',
      titleEn: 'When does the court consider a lawsuit malicious and penalize its filer?',
      descriptionAr: 'مقطع من قناة المكتب على يوتيوب ضمن المكتبة المرئية.',
      descriptionEn: 'A video from the office YouTube channel in the video library.',
      videoUrl: 'https://www.youtube.com/watch?v=s1BJItsZW5s'
    },
    {
      id: 3,
      titleAr: 'انتبه تسوي هالشيء في القضية الجزائية ..!',
      titleEn: 'Do not do this in a criminal case.',
      descriptionAr: 'مقطع من قناة المكتب على يوتيوب ضمن المكتبة المرئية.',
      descriptionEn: 'A video from the office YouTube channel in the video library.',
      videoUrl: 'https://www.youtube.com/watch?v=WNpuOs8dpVM'
    },
    {
      id: 4,
      titleAr: 'وش الفرق بين الشيك والكمبيالة والسند لأمر؟ لا توقع قبل ما تفهم!',
      titleEn: 'What is the difference between a cheque, bill of exchange, and promissory note?',
      descriptionAr: 'مقطع من قناة المكتب على يوتيوب ضمن المكتبة المرئية.',
      descriptionEn: 'A video from the office YouTube channel in the video library.',
      videoUrl: 'https://www.youtube.com/watch?v=_8DCHXqL5SE'
    },
    {
      id: 5,
      titleAr: 'كيف تطالب بالتعويض عن الضرر المعنوي.',
      titleEn: 'How to claim compensation for moral damage.',
      descriptionAr: 'مقطع من قناة المكتب على يوتيوب ضمن المكتبة المرئية.',
      descriptionEn: 'A video from the office YouTube channel in the video library.',
      videoUrl: 'https://www.youtube.com/watch?v=MbEIM-Sf2Ag'
    },
    {
      id: 6,
      titleAr: 'متى يكون حضور المتهم والمدعي العام واجب؟ أمام المحكمة الجزائية .. !',
      titleEn: 'When is the attendance of the accused and public prosecutor required before the criminal court?',
      descriptionAr: 'مقطع من قناة المكتب على يوتيوب ضمن المكتبة المرئية.',
      descriptionEn: 'A video from the office YouTube channel in the video library.',
      videoUrl: 'https://www.youtube.com/watch?v=MTdqLAKv9GE'
    }
  ];
  videos: LocalizedItem[] = [...this.defaultVideos];
  dashboard: any = null;
  consultations: any[] = [];
  dailyVisits: any[] = [];
  adminToken = localStorage.getItem('adminToken') ?? '';
  consultationFilter = 'all';
  editingBlog: LocalizedItem | null = null;
  editingVideo: LocalizedItem | null = null;
  consultationSubmitted = false;
  consultationError = '';

  consultation = { fullName: '', phone: '', email: '', serviceType: 'طلب استشارة', message: '' };
  login = { email: 'admin@lawfirm.local', password: 'ChangeMe123!' };
  newBlog = { titleAr: '', titleEn: '', excerptAr: '', excerptEn: '', contentAr: '', contentEn: '', isPublished: true };
  newVideo = { titleAr: '', titleEn: '', videoUrl: '' };

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer,
    private readonly title: Title,
    private readonly meta: Meta
  ) {}

  ngOnInit(): void {
    this.syncPage(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.syncPage((event as NavigationEnd).urlAfterRedirects);
        this.trackVisit();
      });

    this.loadPublicContent();
    this.trackVisit();

    if (this.adminToken) {
      this.loadAdmin();
    }

    this.heroTimer = setInterval(() => {
      this.heroSlide.set(this.heroSlide() === 0 ? 1 : 0);
    }, 6500);
  }

  switchLanguage(language: Language): void {
    this.language.set(language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    this.updateSeoMetadata();
  }

  closeMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleService(index: number): void {
    this.openServiceIndex.set(this.openServiceIndex() === index ? -1 : index);
  }

  text(item: LocalizedItem, field: 'title' | 'description' | 'excerpt' | 'content'): string {
    const suffix = this.language() === 'ar' ? 'Ar' : 'En';
    return (item as any)[`${field}${suffix}`] ?? '';
  }

  selectedBlog(): LocalizedItem | undefined {
    const id = this.selectedBlogId();
    return id ? this.blogs.find(post => post.id === id) : undefined;
  }

  relatedBlogs(): LocalizedItem[] {
    const selectedId = this.selectedBlogId();
    return this.blogs.filter(post => post.id !== selectedId).slice(0, 3);
  }

  readingTime(post: LocalizedItem): string {
    const content = `${this.text(post, 'excerpt')} ${this.text(post, 'content')}`.trim();
    const words = content ? content.split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return this.language() === 'ar' ? `${minutes} دقائق قراءة` : `${minutes} min read`;
  }

  postDate(post: LocalizedItem): string {
    if (!post.publishedAtUtc) return '';
    return new Intl.DateTimeFormat(this.language() === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(post.publishedAtUtc));
  }

  videoEmbedUrl(url?: string): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');

    const videoId = this.youtubeVideoId(url);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  videoThumbnailUrl(url?: string): string {
    const videoId = this.youtubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/assets/office-hero.jpg';
  }

  submitConsultation(form: NgForm): void {
    this.consultationSubmitted = true;
    this.consultationError = '';

    if (form.invalid) {
      this.consultationError = this.language() === 'ar'
        ? 'يرجى تعبئة الحقول المطلوبة قبل إرسال الطلب.'
        : 'Please complete the required fields before sending.';
      return;
    }

    this.http.post(`${this.apiUrl}/consultations`, this.consultation).subscribe(() => {
      this.consultation = { fullName: '', phone: '', email: '', serviceType: 'طلب استشارة', message: '' };
      this.consultationSubmitted = false;
      form.resetForm(this.consultation);
      alert(this.language() === 'ar' ? 'تم إرسال طلب الاستشارة' : 'Consultation request sent');
    });
  }

  adminLogin(): void {
    this.http.post<{ token: string }>(`${this.apiUrl}/auth/login`, this.login).subscribe(response => {
      this.adminToken = response.token;
      localStorage.setItem('adminToken', response.token);
      this.loadAdmin();
    });
  }

  logout(): void {
    this.adminToken = '';
    this.dashboard = null;
    localStorage.removeItem('adminToken');
  }

  addBlog(): void {
    this.http.post(`${this.apiUrl}/admin/blogs`, this.newBlog, this.adminHeaders()).subscribe(() => {
      this.newBlog = { titleAr: '', titleEn: '', excerptAr: '', excerptEn: '', contentAr: '', contentEn: '', isPublished: true };
      this.loadPublicContent();
      this.loadAdmin();
    });
  }

  startEditBlog(post: LocalizedItem): void {
    this.editingBlog = { ...post };
  }

  updateBlog(): void {
    if (!this.editingBlog) return;
    this.http.put(`${this.apiUrl}/admin/blogs/${this.editingBlog.id}`, this.editingBlog, this.adminHeaders()).subscribe(() => {
      this.editingBlog = null;
      this.loadPublicContent();
      this.loadAdmin();
    });
  }

  cancelEditBlog(): void {
    this.editingBlog = null;
  }

  deleteBlog(id: number): void {
    this.http.delete(`${this.apiUrl}/admin/blogs/${id}`, this.adminHeaders()).subscribe(() => {
      this.loadPublicContent();
      this.loadAdmin();
    });
  }

  addVideo(): void {
    const titleAr = this.newVideo.titleAr.trim() || 'فيديو من يوتيوب';
    const titleEn = this.newVideo.titleEn.trim() || this.newVideo.titleAr.trim() || 'YouTube video';

    const video = {
      titleAr,
      titleEn,
      descriptionAr: 'تمت إضافة هذا الفيديو من لوحة التحكم.',
      descriptionEn: 'This video was added from the dashboard.',
      videoUrl: this.newVideo.videoUrl,
      isPublished: true
    };

    this.http.post(`${this.apiUrl}/admin/videos`, video, this.adminHeaders()).subscribe(() => {
      this.newVideo = { titleAr: '', titleEn: '', videoUrl: '' };
      this.loadPublicContent();
      this.loadAdmin();
    });
  }

  startEditVideo(video: LocalizedItem): void {
    this.editingVideo = { ...video };
  }

  updateVideo(): void {
    if (!this.editingVideo) return;
    this.http.put(`${this.apiUrl}/admin/videos/${this.editingVideo.id}`, this.editingVideo, this.adminHeaders()).subscribe(() => {
      this.editingVideo = null;
      this.loadPublicContent();
      this.loadAdmin();
    });
  }

  cancelEditVideo(): void {
    this.editingVideo = null;
  }

  deleteVideo(id: number): void {
    this.http.delete(`${this.apiUrl}/admin/videos/${id}`, this.adminHeaders()).subscribe(() => {
      this.loadPublicContent();
      this.loadAdmin();
    });
  }

  filteredConsultations(): any[] {
    return this.consultations.filter(item => {
      if (this.consultationFilter === 'pending') return !item.isReviewed;
      if (this.consultationFilter === 'reviewed') return item.isReviewed;
      if (this.consultationFilter === 'appointment') return item.serviceType === 'تحديد موعد';
      if (this.consultationFilter === 'consultation') return item.serviceType === 'طلب استشارة';
      return true;
    });
  }

  markConsultationReviewed(id: number): void {
    this.http.patch(`${this.apiUrl}/admin/consultations/${id}/reviewed`, {}, this.adminHeaders()).subscribe(() => {
      this.loadAdmin();
    });
  }

  whatsappLink(): string {
    const message = this.language() === 'ar'
      ? 'السلام عليكم، أرغب في طلب خدمة قانونية من مكتب خالد الفيفي.'
      : 'Hello, I would like to request a legal service from Khaled Al-Faifi Law Office.';
    return `https://wa.me/966502905007?text=${encodeURIComponent(message)}`;
  }

  private syncPage(url: string): void {
    if (url.startsWith('/services')) this.page.set('services');
    else if (url.startsWith('/blogs')) {
      this.page.set('blogs');
      const blogId = Number(url.match(/^\/blogs\/(\d+)/)?.[1] ?? 0);
      this.selectedBlogId.set(blogId > 0 ? blogId : null);
    }
    else if (url.startsWith('/videos')) this.page.set('videos');
    else if (url.startsWith('/admin')) this.page.set('admin');
    else {
      this.page.set('home');
      this.selectedBlogId.set(null);
    }

    this.closeMenu();
    this.updateSeoMetadata();
  }

  private loadPublicContent(): void {
    this.http.get<LocalizedItem[]>(`${this.apiUrl}/public/services`).subscribe(data => this.services = data);
    this.http.get<LocalizedItem[]>(`${this.apiUrl}/public/blogs`).subscribe(data => {
      this.blogs = data;
      this.updateSeoMetadata();
    });
    this.http.get<LocalizedItem[]>(`${this.apiUrl}/public/videos`).subscribe({
      next: data => this.videos = data.length ? data : [...this.defaultVideos],
      error: () => this.videos = [...this.defaultVideos]
    });
  }

  private loadAdmin(): void {
    this.http.get(`${this.apiUrl}/admin/dashboard`, this.adminHeaders()).subscribe(data => this.dashboard = data);
    this.http.get<any[]>(`${this.apiUrl}/admin/consultations`, this.adminHeaders()).subscribe(data => this.consultations = data);
    this.http.get<any[]>(`${this.apiUrl}/admin/visits/daily`, this.adminHeaders()).subscribe(data => this.dailyVisits = data);
  }

  private trackVisit(): void {
    this.http.post(`${this.apiUrl}/visits`, { pagePath: location.pathname }).subscribe();
  }

  private youtubeVideoId(url?: string): string {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([^&?/]+)/);
    return match?.[1] ?? '';
  }

  private adminHeaders(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders({ Authorization: `Bearer ${this.adminToken}` }) };
  }

  private updateSeoMetadata(): void {
    const lang = this.language();
    const selectedPost = this.selectedBlog();
    const titleMap: Record<Page, string> = {
      home: lang === 'ar'
        ? 'المحامي خالد الفيفي | محاماة واستشارات قانونية في الرياض'
        : 'Lawyer Khaled Al-Faifi | Legal Services in Riyadh',
      services: lang === 'ar'
        ? 'الخدمات القانونية | المحامي خالد الفيفي'
        : 'Legal Services | Lawyer Khaled Al-Faifi',
      blogs: selectedPost
        ? `${this.text(selectedPost, 'title')} | ${lang === 'ar' ? 'المحامي خالد الفيفي' : 'Lawyer Khaled Al-Faifi'}`
        : (lang === 'ar' ? 'المدونة القانونية | المحامي خالد الفيفي' : 'Legal Blog | Lawyer Khaled Al-Faifi'),
      videos: lang === 'ar'
        ? 'المكتبة المرئية | المحامي خالد الفيفي'
        : 'Video Library | Lawyer Khaled Al-Faifi',
      admin: lang === 'ar' ? 'لوحة التحكم | خالد الفيفي' : 'Admin Dashboard | Khaled Al-Faifi'
    };

    const description = selectedPost
      ? this.text(selectedPost, 'excerpt')
      : (lang === 'ar'
        ? 'مكتب المحامي خالد الفيفي للمحاماة والاستشارات القانونية في الرياض، يقدم خدمات قانونية للأفراد والشركات وفق الأنظمة السعودية.'
        : 'Lawyer Khaled Al-Faifi Law Office in Riyadh, providing legal services for individuals and companies under Saudi regulations.');

    this.title.setTitle(titleMap[this.page()]);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: lang === 'ar'
      ? 'المحامي خالد الفيفي, مكتب المحامي خالد الفيفي, محامي في الرياض, محاماة واستشارات قانونية, خالد الفيفي'
      : 'Lawyer Khaled Al-Faifi, Khaled Al-Faifi Law Office, lawyer in Riyadh, legal consultations Saudi Arabia' });
    this.meta.updateTag({ property: 'og:title', content: titleMap[this.page()] });
    this.meta.updateTag({ property: 'og:description', content: description });
    const siteUrl = environment.siteUrl || window.location.origin;
    this.meta.updateTag({ property: 'og:image', content: `${siteUrl}/assets/law-hero-luxury-office.png` });
    this.meta.updateTag({ property: 'og:type', content: selectedPost ? 'article' : 'website' });
    this.meta.updateTag({ property: 'og:url', content: `${siteUrl}${this.router.url}` });
    this.meta.updateTag({ property: 'og:locale', content: lang === 'ar' ? 'ar_SA' : 'en_US' });
  }
}
