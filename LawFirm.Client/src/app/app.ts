import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

type Language = 'ar' | 'en';
type Page = 'home' | 'blogs' | 'videos' | 'admin';

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
  blogs: LocalizedItem[] = [];
  videos: LocalizedItem[] = [];
  dashboard: any = null;
  consultations: any[] = [];
  dailyVisits: any[] = [];
  adminToken = localStorage.getItem('adminToken') ?? '';

  consultation = { fullName: '', phone: '', email: '', message: '' };
  login = { email: 'admin@lawfirm.local', password: 'ChangeMe123!' };
  newBlog = { titleAr: '', titleEn: '', excerptAr: '', excerptEn: '', contentAr: '', contentEn: '', isPublished: true };
  newVideo = { titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', videoUrl: '', isPublished: true };

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

    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
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
    this.http.post(`${this.apiUrl}/admin/videos`, this.newVideo, this.adminHeaders()).subscribe(() => {
      this.newVideo = { titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', videoUrl: '', isPublished: true };
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
    if (url.startsWith('/blogs')) this.page.set('blogs');
    else if (url.startsWith('/videos')) this.page.set('videos');
    else if (url.startsWith('/admin')) this.page.set('admin');
    else this.page.set('home');
  }

  private loadPublicContent(): void {
    this.http.get<LocalizedItem[]>(`${this.apiUrl}/public/services`).subscribe(data => this.services = data);
    this.http.get<LocalizedItem[]>(`${this.apiUrl}/public/blogs`).subscribe(data => this.blogs = data);
    this.http.get<LocalizedItem[]>(`${this.apiUrl}/public/videos`).subscribe(data => this.videos = data);
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
