import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { KnowledgeHubService } from './services/knowledge-hub.service';
import {
  CategoryListResponseModel,
  DirectoryItemResponseModel,
  ReferencableType,
  DirectoryItemType,
  TreeNode,
  ArticleContent,
  FAQ
} from './models/knowledge-hub.models';
import { FreshdeskCategoryRequest, FreshdeskFolderRequest, ListCategoryModel, ListFolderModel } from './knowledge-hub.model';
import {OnlyOfficeComponent} from '../only-office/only-office.component';

@Component({
  selector: 'app-knowledge-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, OnlyOfficeComponent],
  templateUrl: './knowledge-hub.component.html',
  styleUrl: './knowledge-hub.component.scss'
})
export class KnowledgeHubComponent implements OnInit {
  @ViewChild('onlyOfficeEditor') onlyOfficeEditor?: OnlyOfficeComponent;
  activeTab: ReferencableType = ReferencableType.ARTICLE;
  treeNodes: TreeNode[] = [];
  loading = false;
  selectedItem: TreeNode | null = null;
  currentArticle: ArticleContent | null = null;
  loadingArticle = false;
  showWelcome = true;
  faqs: FAQ[] = [];

  // OnlyOffice integration state
  currentPdfUrl: string | null = null;
  safePdfUrl: SafeResourceUrl | null = null;
  showPdfPreview = false;
  isPdfFile = false;
  showOnlyOffice = false;
  isEditing = false;
  // Track which item is being published (works for both article and PDF)
  publishingArticleId: number | null = null;
  // Track which category's FAQs are currently displayed
  faqsCategoryId: number | null = null;
  // Currently selected FAQ for right-side display
  selectedFaq: FAQ | null = null;

  // Expose enum to template
  ReferencableType = ReferencableType;

  // Publish modal state
  showPublishModal = false;
  categories: ListCategoryModel[] = [];
  folders: ListFolderModel[] = [];
  categoryMode: 'select' | 'create' = 'select';
  folderMode: 'select' | 'create' = 'select';
  selectedCategoryId: number | null = null;
  newCategoryName = '';
  newCategoryDescription = '';
  selectedFolderId: number | null = null;
  newFolderName = '';
  modalLoading = false;

  // Add FAQ modal state
  showAddFaqModal = false;
  faqPrompt = '';
  faqCount = 1;
  submittingFaq = false;

  constructor(
    private knowledgeHubService: KnowledgeHubService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  // Add FAQ modal actions
  openAddFaq(): void {
    this.faqPrompt = '';
    this.faqCount = 1;
    this.submittingFaq = false;
    this.showAddFaqModal = true;
  }

  closeAddFaq(): void {
    this.showAddFaqModal = false;
  }

  submitGenerateFaq(): void {
    const prompt = this.faqPrompt.trim();
    if (!prompt) {
      alert('Please enter a prompt');
      return;
    }
    const moduleId = this.selectedItem?.id || 0;
    const categoryId = (this.selectedItem?.categoryId) || 0;
    const model = {
      applicationId: 1,
      moduleId: moduleId,
      count: this.faqCount || 1,
      prompt: prompt,
      categoryId: categoryId,
      createNewCategory: false,
      categoryModel: {
        name: 'Default',
        description: '',
        applicationId: 1,
        type: ReferencableType.FAQ
      },
      userId: 1
    };
    this.submittingFaq = true;
    // @ts-ignore
    this.knowledgeHubService.generateFaq(model).subscribe({
      next: () => {
        this.submittingFaq = false;
        this.showAddFaqModal = false;
        if (this.activeTab === ReferencableType.FAQ && this.selectedItem?.id) {
          this.loadFaqsForModule(this.selectedItem.id);
        }
      },
      error: (err) => {
        console.error('Error generating FAQ:', err);
        this.submittingFaq = false;
        alert('Failed to generate FAQs');
      }
    });
  }

  onTabClick(tab: ReferencableType): void {
    this.activeTab = tab;
    this.selectedFaq = null;
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
          expanded: true,
          loading: false
        }));

        // Always load items for categories
        this.treeNodes.forEach(category => {
          this.loadCategoryItems(category);
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
  }

  onFaqClick(faq: FAQ, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.selectedFaq = faq;
    this.showWelcome = false;
    this.loadingArticle = false;
  }

  onNodeClick(node: TreeNode): void {
    if (node.type === 'category') {
      // In both tabs, expand/toggle to show items under the category
      this.toggleCategory(node);
    } else if (node.type === 'folder') {
      // In both tabs, allow navigating folders
      this.toggleFolder(node);
    } else if (node.type === 'file') {
      if (this.activeTab === ReferencableType.FAQ) {
        // In FAQ tab, clicking a file loads FAQs inline but keeps right panel as-is
        this.selectedItem = node;
        this.currentArticle = null;
        this.showOnlyOffice = false;
        this.faqs = [];
        this.loadFaqsForModule(node.id);
      } else {
        // In Articles tab, open the file/article
        this.selectFile(node);
      }
    }
  }

  private loadFaqsForCategory(categoryId: number): void {
    this.showWelcome = false;
    this.loadingArticle = true;
    this.currentArticle = null;
    this.showOnlyOffice = false;
    this.faqs = [];
    this.faqsCategoryId = categoryId;
    this.selectedFaq = null;

    const applicationId = 1; // align with backend appId usage
    this.knowledgeHubService.getFaqs(applicationId, categoryId).subscribe({
      next: (faqs) => {
        this.faqs = faqs || [];
        // still keep welcome; right panel changes only when a FAQ is selected
      },
      error: (error) => {
        console.error('Error loading FAQs:', error);
        // keep state untouched on error
      }
    });
  }

  private loadFaqsForModule(moduleId: number): void {
    // Keep welcome content visible; only change after a specific FAQ is clicked
    this.currentArticle = null;
    this.showOnlyOffice = false;
    this.faqs = [];
    this.selectedFaq = null;

    const applicationId = 1;
    this.knowledgeHubService.getFaqs(applicationId, moduleId).subscribe({
      next: (faqs) => {
        this.faqs = faqs || [];
        this.loadingArticle = false;
      },
      error: (error) => {
        console.error('Error loading FAQs:', error);
        this.loadingArticle = false;
      }
    });
  }

  private loadCategoryItems(category: TreeNode): void {
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
          expanded: item.itemType === DirectoryItemType.FOLDER ? true : false,
          loading: false
        }));

        // Auto-expand all folders
        const folders = category.children.filter(child => child.type === 'folder');
        folders.forEach(folder => {
          this.loadFolderItems(folder);
        });

        category.loading = false;
      },
      error: (error) => {
        console.error('Error loading category items:', error);
        category.loading = false;
      }
    });
  }

  private toggleCategory(category: TreeNode): void {
    if (category.expanded) {
      category.expanded = false;
      category.children = [];
    } else {
      category.expanded = true;
      this.loadCategoryItems(category);
    }
  }

  private loadFolderItems(folder: TreeNode): void {
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
          url: item.url,
          loading: false
        }));
        folder.loading = false;
      },
      error: (error) => {
        console.error('Error loading folder items:', error);
        folder.loading = false;
      }
    });
  }

  private toggleFolder(folder: TreeNode): void {
    if (folder.expanded) {
      folder.expanded = false;
      folder.children = [];
    } else {
      folder.expanded = true;
      this.loadFolderItems(folder);
    }
  }


  private selectFile(file: TreeNode): void {
    this.selectedItem = file;
    this.showWelcome = false;
    this.loadingArticle = true;

    // Reset previous states
    this.currentArticle = null;
    this.currentPdfUrl = null;
    this.safePdfUrl = null;
    this.showPdfPreview = false;
    this.isPdfFile = false;

    const filename = file.name;

    // Check if file is a document to open in OnlyOffice (including PDFs)
    if (filename && (filename.toLowerCase().endsWith('.pdf') || filename.toLowerCase().endsWith('.doc') || filename.toLowerCase().endsWith('.docx') || filename.toLowerCase().endsWith('.ppt') || filename.toLowerCase().endsWith('.pptx') || filename.toLowerCase().endsWith('.xls') || filename.toLowerCase().endsWith('.xlsx'))) {
      this.isPdfFile = filename.toLowerCase().endsWith('.pdf');
      this.showOnlyOffice = true;
      this.isEditing = false; // open in view mode first
      this.loadingArticle = false;
      this.showPdfPreview = false;
    } else {
      // Handle non-PDF files - load article content
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
  }

  onEditArticle(): void {
    if (this.showOnlyOffice && this.selectedItem?.name) {
      // Toggle inline edit mode. Note: for PDFs this enables OnlyOffice PDF editor (annotations/forms),
      // not direct text edits of existing content unless backend converts to DOCX in config.
      this.isEditing = true;
      return;
    }
    const targetId = this.currentArticle?.id;
    if (!targetId) return;
    // For non-document articles, fallback behavior (no external edit URL)
    alert('Editing is available for documents via OnlyOffice.');
  }

  onPublishArticle(): void {
    const targetId = this.isPdfFile && this.selectedItem ? this.selectedItem.id : this.currentArticle?.id;
    if (!targetId) return;
    this.openPublishModal(targetId);
  }

  onBackToWelcome(): void {
    this.showWelcome = true;
    this.currentArticle = null;
    this.selectedItem = null;
    this.currentPdfUrl = null;
    this.safePdfUrl = null;
    this.showPdfPreview = false;
    this.isPdfFile = false;
    this.showOnlyOffice = false;
    this.isEditing = false;
  }

  // Edit mode actions
  onSaveEdit(): void {
    if (this.showOnlyOffice) {
      this.onlyOfficeEditor?.saveDocument();
    }
    const name = this.selectedItem?.name || '';
    if (name) {
      const encoded = encodeURIComponent(name);
      const url = `http://localhost:8080/api/aq/documents/config/${encoded}?mode=view`;
      this.http.get(url).subscribe({
        next: () => {
          // Exiting edit mode triggers OnlyOffice to switch to readOnly and re-init
          this.isEditing = false;
        },
        error: (err) => {
          console.error('Refresh config after save failed:', err);
          // Even on error, exit edit mode to avoid being stuck
          this.isEditing = false;
        }
      });
    } else {
      this.isEditing = false;
    }
  }

  onCancelEdit(): void {
    this.isEditing = false;
  }

  // Keyboard shortcut: Ctrl+S / Cmd+S triggers save while editing
  @HostListener('window:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent): void {
    if (!this.isEditing) return;
    const isSaveCombo = (event.ctrlKey || event.metaKey) && (event.key === 's' || event.key === 'S');
    if (isSaveCombo) {
      event.preventDefault();
      this.onSaveEdit();
    }
  }

  getDocumentType(name: string): 'word' | 'cell' | 'slide' {
    const n = name.toLowerCase();
    if (n.endsWith('.xlsx') || n.endsWith('.xls') || n.endsWith('.ods')) return 'cell';
    if (n.endsWith('.ppt') || n.endsWith('.pptx') || n.endsWith('.odp')) return 'slide';
    // pdf and word-like docs open in word editor for viewing
    return 'word';
  }

  downloadPdf(): void {
    if (!this.currentPdfUrl) return;

    const link = document.createElement('a');
    link.href = this.currentPdfUrl;
    link.download = this.selectedItem?.name || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openPdfInNewTab(): void {
    if (!this.currentPdfUrl) return;
    window.open(this.currentPdfUrl, '_blank');
  }

  copyLink(): void {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      alert('Failed to copy link');
    });
  }

  getNodeIcon(node: TreeNode): string {
    if (node.type === 'category') {
      return node.expanded ? 'bi-chevron-down' : 'bi-chevron-right';
    } else if (node.type === 'folder') {
      return node.expanded ? 'bi-folder2-open' : 'bi-folder2';
    } else {
      // Check if file is PDF
      if (node.name && node.name.toLowerCase().endsWith('.pdf')) {
        return 'bi-file-pdf';
      }
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
      // Add PDF-specific class
      if (node.name && node.name.toLowerCase().endsWith('.pdf')) {
        classes.push('pdf-file');
      }
    }
    if (this.selectedItem?.id === node.id) {
      classes.push('selected');
    }
    return classes.join(' ');
  }

  getSelectedCategoryName(): string {
    if (!this.selectedCategoryId) return '';
    const c = this.categories.find((x) => x.id === this.selectedCategoryId);
    return c ? c.name : '';
  }

  getSelectedFolderName(): string {
    if (!this.selectedFolderId) return '';
    const f = this.folders.find((x) => x.id === this.selectedFolderId);
    return f ? f.name : '';
  }

  // Publish modal methods
  private loadAllCategoriesForModal(): void {
    this.modalLoading = true;
    this.knowledgeHubService.listAllCategory().subscribe({
      next: (cats) => {
        this.categories = cats || [];
        this.modalLoading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.modalLoading = false;
      }
    });
  }

  private loadFoldersForCategory(categoryId: number): void {
    this.modalLoading = true;
    const cat = this.categories.find(c => c.id === categoryId) || { id: categoryId, name: '' } as ListCategoryModel;
    this.knowledgeHubService.listAllFolders(cat).subscribe({
      next: (items) => {
        this.folders = items || [];
        this.modalLoading = false;
      },
      error: (err) => {
        console.error('Error loading folders:', err);
        this.modalLoading = false;
      }
    });
  }

  openPublishModal(articleId: number): void {
    this.showPublishModal = true;
    this.categoryMode = 'select';
    this.folderMode = 'select';
    this.selectedCategoryId = null;
    this.selectedFolderId = null;
    this.newCategoryName = '';
    this.newCategoryDescription = '';
    this.newFolderName = '';
    this.categories = [];
    this.folders = [];
    this.publishingArticleId = articleId;
    this.loadAllCategoriesForModal();
  }

  closePublishModal(): void {
    this.showPublishModal = false;
  }

  createCategoryAction(): void {
    if (!this.newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }
    this.modalLoading = true;
    const req: FreshdeskCategoryRequest = { name: this.newCategoryName.trim(), description: this.newCategoryDescription.trim() };
    this.knowledgeHubService.createCategory(req).subscribe({
      next: (ok) => {
        if (ok) {
          this.knowledgeHubService.listAllCategory().subscribe({
            next: (cats) => {
              this.categories = cats || [];
              const created = this.categories.find(c => c.name === this.newCategoryName.trim());
              this.selectedCategoryId = created ? created.id : null;
              if (this.selectedCategoryId) {
                this.loadFoldersForCategory(this.selectedCategoryId);
              }
              this.categoryMode = 'select';
              this.newCategoryName = '';
              this.newCategoryDescription = '';
              this.modalLoading = false;
            },
            error: () => {
              this.categoryMode = 'select';
              this.modalLoading = false;
            }
          });
        } else {
          this.modalLoading = false;
          alert('Failed to create category');
        }
      },
      error: (err) => {
        console.error('Error creating category:', err);
        this.modalLoading = false;
        alert('Failed to create category');
      }
    });
  }

  createFolderAction(): void {
    if (!this.selectedCategoryId) {
      alert('Please select a category first');
      return;
    }
    if (!this.newFolderName.trim()) {
      alert('Please enter a folder name');
      return;
    }
    this.modalLoading = true;
    const folderReq: FreshdeskFolderRequest = { name: this.newFolderName.trim(), description: '' };
    this.knowledgeHubService.createFolder(folderReq, this.selectedCategoryId).subscribe({
      next: (ok) => {
        if (ok) {
          const cat = this.categories.find(c => c.id === this.selectedCategoryId) || { id: this.selectedCategoryId, name: '' } as ListCategoryModel;
          this.knowledgeHubService.listAllFolders(cat).subscribe({
            next: (folders) => {
              this.folders = folders || [];
              const created = this.folders.find(f => f.name === this.newFolderName.trim());
              this.selectedFolderId = created ? created.id : null;
              this.folderMode = 'select';
              this.newFolderName = '';
              this.modalLoading = false;
            },
            error: () => {
              this.folderMode = 'select';
              this.modalLoading = false;
            }
          });
        } else {
          this.modalLoading = false;
          alert('Failed to create folder');
        }
      },
      error: (err) => {
        console.error('Error creating folder:', err);
        this.modalLoading = false;
        alert('Failed to create folder');
      }
    });
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.selectedFolderId = null;
    this.folders = [];
    if (categoryId) {
      this.loadFoldersForCategory(categoryId);
    }
  }

  confirmPublish(): void {
    if (!this.publishingArticleId) return;
    if (!this.selectedCategoryId || !this.selectedFolderId) return;
    this.modalLoading = true;
    this.knowledgeHubService.publishFreshdeskArticle(this.publishingArticleId, this.selectedFolderId).subscribe({
      next: () => {
        if (this.currentArticle && this.currentArticle.id === this.publishingArticleId) {
          this.currentArticle.status = 'Published';
        }
        this.modalLoading = false;
        this.closePublishModal();
      },
      error: (error) => {
        console.error('Error publishing article:', error);
        this.modalLoading = false;
      }
    });
  }
}
