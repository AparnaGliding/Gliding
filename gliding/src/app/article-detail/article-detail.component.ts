import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AppDashboardService } from '../app-dashboard/app-dashboard.service';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss']
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appDashboardService = inject(AppDashboardService);

  applicationName = '';
  moduleId = '';
  articleId!: number;

  title = '';
  content: string | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.applicationName = this.route.snapshot.paramMap.get('name') || '';
    this.moduleId = this.route.snapshot.paramMap.get('id') || '';
    const aid = this.route.snapshot.paramMap.get('articleId');
    this.articleId = aid ? Number(aid) : 0;

    const nav = this.router.getCurrentNavigation();
    const state = (nav && nav.extras && nav.extras.state) ? (nav.extras.state as any) : null;
    if (state?.article) {
      this.title = state.article.question || 'Article';
      this.content = state.article.content || null;
      if (this.content) {
        this.isLoading = false;
        return;
      }
    }

    if (this.articleId) {
      this.appDashboardService.getArticleById(this.articleId).subscribe({
        next: (res: any) => {
          this.title = res?.question || this.title || 'Article';
          this.content = res?.content || null;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.content = null;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  backToModule(): void {
    if (!this.applicationName || !this.moduleId) return;
    this.router.navigate(['/apps', this.applicationName, 'dashboard', 'modules', this.moduleId]);
  }
}
