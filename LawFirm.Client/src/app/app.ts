import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

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
  private readonly apiUrl = 'http://localhost:5081/api';

  language = signal<Language>('ar');
  page = signal<Page>('home');
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

  consultation = { fullName: '', phone: '', email: '', message: '' };
  login = { email: 'admin@lawfirm.local', password: 'ChangeMe123!' };
  newBlog = { titleAr: '', titleEn: '', excerptAr: '', excerptEn: '', contentAr: '', contentEn: '', isPublished: true };
  newVideo = { titleAr: '', titleEn: '', videoUrl: '' };

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer
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
  }

  switchLanguage(language: Language): void {
    this.language.set(language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }

  text(item: LocalizedItem, field: 'title' | 'description' | 'excerpt' | 'content'): string {
    const suffix = this.language() === 'ar' ? 'Ar' : 'En';
    return (item as any)[`${field}${suffix}`] ?? '';
  }

  videoEmbedUrl(url?: string): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');

    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([^&?/]+)/);
    const embedUrl = match ? `https://www.youtube.com/embed/${match[1]}` : url;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  submitConsultation(): void {
    this.http.post(`${this.apiUrl}/consultations`, this.consultation).subscribe(() => {
      this.consultation = { fullName: '', phone: '', email: '', message: '' };
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

  deleteVideo(id: number): void {
    this.http.delete(`${this.apiUrl}/admin/videos/${id}`, this.adminHeaders()).subscribe(() => {
      this.loadPublicContent();
      this.loadAdmin();
    });
  }

  private syncPage(url: string): void {
    if (url.startsWith('/services')) this.page.set('services');
    else if (url.startsWith('/blogs')) this.page.set('blogs');
    else if (url.startsWith('/videos')) this.page.set('videos');
    else if (url.startsWith('/admin')) this.page.set('admin');
    else this.page.set('home');
  }

  private loadPublicContent(): void {
    this.http.get<LocalizedItem[]>(`${this.apiUrl}/public/services`).subscribe(data => this.services = data);
    this.http.get<LocalizedItem[]>(`${this.apiUrl}/public/blogs`).subscribe(data => this.blogs = data);
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

  private adminHeaders(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders({ 'X-Admin-Token': this.adminToken }) };
  }
}
