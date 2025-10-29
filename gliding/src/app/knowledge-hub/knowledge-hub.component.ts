import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnowledgeHubService } from './services/knowledge-hub.service';
import {
  CategoryListResponseModel,
  DirectoryItemResponseModel,
  ReferencableType,
  DirectoryItemType,
  TreeNode,
  ArticleContent
} from './models/knowledge-hub.models';

@Component({
  selector: 'app-knowledge-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './knowledge-hub.component.html',
  styleUrl: './knowledge-hub.component.scss'
})
export class KnowledgeHubComponent implements OnInit {
  activeTab: ReferencableType = ReferencableType.FAQ;
  treeNodes: TreeNode[] = [];
  loading = false;
  selectedItem: TreeNode | null = null;
  currentArticle: ArticleContent | null = null;
  loadingArticle = false;
  showWelcome = true;

  // Expose enum to template
  ReferencableType = ReferencableType;

  constructor(private knowledgeHubService: KnowledgeHubService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  onTabClick(tab: ReferencableType): void {
    this.activeTab = tab;
    this.loadCategories();
  }

  private loadCategories(): void {
    this.loading = true;
    this.knowledgeHubService.getAllCategories(this.activeTab).subscribe({
      next: (categories) => {
        this.treeNodes = categories.map(category => ({
          id: category.id,
          name: category.name,
          type: 'category',
          referencableType: category.type,
          children: [],
          expanded: false,
          loading: false
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
  }

  onNodeClick(node: TreeNode): void {
    if (node.type === 'category') {
      this.toggleCategory(node);
    } else if (node.type === 'folder') {
      this.toggleFolder(node);
    } else if (node.type === 'file') {
      this.selectFile(node);
    }
  }

  private toggleCategory(category: TreeNode): void {
    if (category.expanded) {
      category.expanded = false;
      category.children = [];
    } else {
      category.loading = true;
      this.knowledgeHubService.getItemsByCategory(category.id).subscribe({
        next: (items) => {
          category.children = items.map(item => ({
            id: item.id,
            name: item.name,
            type: item.itemType === DirectoryItemType.FOLDER ? 'folder' : 'file',
            parentId: item.parentId,
            categoryId: item.categoryId,
            children: [],
            expanded: false,
            loading: false
          }));
          category.expanded = true;
          category.loading = false;
        },
        error: (error) => {
          console.error('Error loading category items:', error);
          category.loading = false;
        }
      });
    }
  }

  private toggleFolder(folder: TreeNode): void {
    if (folder.expanded) {
      folder.expanded = false;
      folder.children = [];
    } else {
      folder.loading = true;
      this.knowledgeHubService.getItemsByCategory(folder.categoryId!, folder.id).subscribe({
        next: (items) => {
          folder.children = items.map(item => ({
            id: item.id,
            name: item.name,
            type: item.itemType === DirectoryItemType.FOLDER ? 'folder' : 'file',
            parentId: item.parentId,
            categoryId: item.categoryId,
            children: [],
            expanded: false,
            loading: false
          }));
          folder.expanded = true;
          folder.loading = false;
        },
        error: (error) => {
          console.error('Error loading folder items:', error);
          folder.loading = false;
        }
      });
    }
  }

  private selectFile(file: TreeNode): void {
    this.selectedItem = file;
    this.showWelcome = false;
    this.loadingArticle = true;

    this.knowledgeHubService.getArticleById(file.id).subscribe({
      next: (article) => {
        this.currentArticle = article;
        this.loadingArticle = false;
      },
      error: (error) => {
        console.error('Error loading article:', error);
        this.loadingArticle = false;
        // Show error message or fallback content
      }
    });
  }

  onEditArticle(): void {
    if (!this.currentArticle) return;

    this.knowledgeHubService.getOnlyOfficeEditUrl(this.currentArticle.id).subscribe({
      next: (response) => {
        // Open OnlyOffice editor in a new window/tab
        window.open(response.editUrl, '_blank', 'width=1200,height=800');
      },
      error: (error) => {
        console.error('Error getting edit URL:', error);
        alert('Unable to open editor. Please try again.');
      }
    });
  }

  onPublishArticle(): void {
    if (!this.currentArticle) return;

    if (confirm('Are you sure you want to publish this article?')) {
      this.knowledgeHubService.publishArticle(this.currentArticle.id).subscribe({
        next: () => {
          // Update article status
          this.currentArticle!.status = 'Published';
          alert('Article published successfully!');
        },
        error: (error) => {
          console.error('Error publishing article:', error);
          alert('Failed to publish article. Please try again.');
        }
      });
    }
  }

  onBackToWelcome(): void {
    this.showWelcome = true;
    this.currentArticle = null;
    this.selectedItem = null;
  }

  getNodeIcon(node: TreeNode): string {
    if (node.type === 'category') {
      return node.expanded ? 'bi-chevron-down' : 'bi-chevron-right';
    } else if (node.type === 'folder') {
      return node.expanded ? 'bi-folder2-open' : 'bi-folder2';
    } else {
      return 'bi-file-text';
    }
  }

  getNodeClass(node: TreeNode): string {
    const classes = ['tree-item'];
    if (node.type === 'category' || node.type === 'folder') {
      classes.push('expandable');
    }
    if (node.type === 'file') {
      classes.push('file-item');
    }
    if (this.selectedItem?.id === node.id) {
      classes.push('selected');
    }
    return classes.join(' ');
  }
}
