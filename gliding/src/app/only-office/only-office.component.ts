import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgIf} from '@angular/common';
declare const DocsAPI: any; // Declare OnlyOffice API

@Component({
  selector: 'app-only-office',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './only-office.component.html',
  styleUrl: './only-office.component.css'
})
export class OnlyOfficeComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() documentId: string = "jj";
  @Input() fileName: string = "assistq-response-1759302620211.docx";
  @Input() readOnly: boolean = false;
  @Input() documentType: string = 'word'; // word, cell, slide
  @Input() apiUrl: string = 'http://localhost:8080/api/documents';
  @Input() hiddenTabs: string[] = ["Insert", "Layout", "Draw", "Protection", "Plugins"];
  @Input() downloadBaseUrl: string = 'http://host.docker.internal:8080/api/aq/documents/download';
  @Input() callbackUrl: string = 'http://host.docker.internal:8080/api/aq/documents/track';
  @Input() onlyOfficeApiUrl: string = 'http://localhost:8082/web-apps/apps/api/documents/api.js';

  // Outputs
  @Output() documentReady = new EventEmitter<void>();
  @Output() documentModified = new EventEmitter<void>();
  @Output() documentError = new EventEmitter<any>();
  @Output() documentSaved = new EventEmitter<any>();

  // Internal properties
  currentEditor: any = null;
  isLoading: boolean = true;
  editorStatus: string = 'loading';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.checkOnlyOfficeAPI();
  }

  ngAfterViewInit(): void {
    const proceed = () => {
      if (this.fileName || this.documentId) {
        console.log("loading editor");
        this.loadEditor();
      }
    };
    if (typeof DocsAPI === 'undefined') {
      let timedOut = false;
      const t = setTimeout(() => { timedOut = true; }, 8000);
      this.ensureOnlyOfficeAPILoaded()
        .then(() => {
          clearTimeout(t);
          proceed();
        })
        .catch((err) => {
          clearTimeout(t);
          this.documentError.emit({ message: 'OnlyOffice Document Server API could not be loaded', error: err });
        });
      // If neither load nor error fires (network stalled), emit a soft error after timeout
      setTimeout(() => {
        if (timedOut && typeof DocsAPI === 'undefined') {
          this.documentError.emit({ message: 'OnlyOffice Document Server API could not be loaded' });
        }
      }, 8200);
    } else {
      proceed();
    }
  }

  ngOnDestroy(): void {
    this.destroyEditor();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const fileChanged = !!changes['fileName'] && !changes['fileName'].firstChange;
    const modeChanged = !!changes['readOnly'] && !changes['readOnly'].firstChange;
    // Reinitialize editor if file or mode changed and we already initialized once
    if ((fileChanged || modeChanged)) {
      // If API not loaded yet, defer to ngAfterViewInit
      const proceed = () => {
        this.destroyEditor();
        this.loadEditor();
      };
      if (typeof DocsAPI === 'undefined') {
        this.ensureOnlyOfficeAPILoaded().then(proceed).catch(() => {/* swallow */});
      } else {
        proceed();
      }
    }
  }

  // Public methods that parent components can access

  /**
   * Load a document for editing
   * @param fileName Optional filename to override the input property
   */
  loadDocument(fileName: string): void {
    this.fileName = fileName;
    this.loadEditor();
  }

  /**
   * Save current document
   */
  saveDocument(): void {
    if (this.currentEditor) {
      this.currentEditor.downloadAs();
      this.editorStatus = 'saved';
      this.documentSaved.emit();
    }
  }

  /**
   * Download current document
   */
  downloadDocument(): void {
    if (this.currentEditor) {
      this.currentEditor.downloadAs();
    }
  }

  /**
   * Get current editor instance
   */
  getEditor(): any {
    return this.currentEditor;
  }

  // Private methods

  private checkOnlyOfficeAPI(): void {
    if (typeof DocsAPI === 'undefined') {
      // Try to load silently; do not emit errors here to avoid noisy logs before we actually need the editor.
      this.ensureOnlyOfficeAPILoaded().catch(() => { /* swallow here; ngAfterViewInit handles errors */ });
    }
  }

  private ensureOnlyOfficeAPILoaded(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (typeof DocsAPI !== 'undefined') {
        resolve();
        return;
      }
      // Avoid duplicating the script
      const existing = document.querySelector('script#onlyoffice-api-js') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (e) => reject(e));
        return;
      }
      const script = document.createElement('script');
      script.id = 'onlyoffice-api-js';
      script.src = this.onlyOfficeApiUrl;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  }

  private loadEditor(): void {
    this.isLoading = true;

    // Get document configuration from backend
    const encoded = encodeURIComponent(this.fileName);
    const mode = this.readOnly ? 'view' : 'edit';
    this.http.get<any>(`/documents/config/${encoded}?mode=${mode}`)
      .subscribe({
        next: (config) => {
          // Force document URL to use provided download API if available
          if (this.downloadBaseUrl) {
            const cleanFileName = encodeURIComponent(this.fileName);
            config.document = {
              ...config.document,
              url: `${this.downloadBaseUrl}/${cleanFileName}`
            };
          }
          // Ensure callback URL is reachable from Document Server container
          if (this.callbackUrl) {
            config.editorConfig = {
              ...config.editorConfig,
              callbackUrl: this.callbackUrl
            };
          }
          this.initializeEditor(config);
        },
        error: (error) => {
          this.isLoading = false;
          this.editorStatus = 'error';
          this.documentError.emit(error);
          console.error('Editor config error:', error);
        }
      });
  }

  private initializeEditor(config: any): void {
    // Override config with component inputs if provided
    if (this.documentType) {
      config.documentType = this.documentType;
    }

    // Adjust for read-only mode if needed
    if (this.readOnly) {
      config.editorConfig = {
        ...config.editorConfig,
        mode: 'view'
      };
      config.document = {
        ...config.document,
        permissions: {
          ...config.document?.permissions,
          edit: false
        }
      };
    } else {
      // Ensure explicit edit mode when not read-only
      config.editorConfig = {
        ...config.editorConfig,
        mode: 'edit'
      };
      config.document = {
        ...config.document,
        permissions: {
          ...config.document?.permissions,
          edit: true
        }
      };
    }

    const editorConfig = {
      documentType: config.documentType,
      document: config.document,
      editorConfig: {
        ...config.editorConfig,
        callbackUrl: config.editorConfig.callbackUrl,
        customization: {
          ...config.editorConfig.customization,
          autosave: true,
          forcesave: true,
          comments: !this.readOnly,
          chat: false,
          help: true,
          compactToolbar: false,
          feedback: false,
          plugins: false
        },
        events: {
          onDocumentReady: this.onDocumentReady.bind(this),
          onDocumentStateChange: this.onDocumentStateChange.bind(this),
          onError: this.onError.bind(this),
          onWarning: this.onWarning.bind(this)
        }
      },
      width: '100%',
      height: '100%'
    };

    // Initialize the editor
    this.currentEditor = new DocsAPI.DocEditor('onlyoffice-editor-container', editorConfig);
    this.isLoading = false;

    // Hide specified toolbar tabs after rendering
    if (this.hiddenTabs.length > 0) {
      this.waitForEditorToRenderAndHideTabs();
    }
  }

  // Editor event handlers
  private onDocumentReady(): void {
    console.log('Document is ready');
    this.editorStatus = 'ready';
    this.documentReady.emit();
  }

  private onDocumentStateChange(event: any): void {
    this.editorStatus = 'modified';
    this.documentModified.emit();
  }

  private onError(event: any): void {
    console.error('Editor error:', event);
    this.editorStatus = 'error';
    this.documentError.emit(event);
  }

  private onWarning(event: any): void {
    console.warn('Editor warning:', event);
  }

  // Hide specified toolbar tabs
  private waitForEditorToRenderAndHideTabs(): void {
    const tabsToHide = this.hiddenTabs;

    const hideTabs = () => {
      try {
        // Access OnlyOffice iframe
        const editorIframe = document.querySelector('#onlyoffice-editor-container iframe') as HTMLIFrameElement;
        if (!editorIframe) return;

        const innerDoc = editorIframe.contentDocument || (editorIframe.contentWindow?.document);
        if (!innerDoc) return;

        tabsToHide.forEach(tab => {
          const el = innerDoc.querySelector(`[title="${tab}"]`) as HTMLElement;
          if (el) {
            el.style.display = "none";
            console.log(`Hidden tab: ${tab}`);
          }
        });
      } catch (err) {
        console.warn("Tab hiding failed:", err);
      }
    };

    // Run repeatedly to catch async toolbar rendering
    hideTabs();
    setTimeout(hideTabs, 1000);
    setTimeout(hideTabs, 3000);
    setTimeout(hideTabs, 5000);
  }

  // Destroy editor instance
  @Input() content!: string;
  @Output() contentChanged = new EventEmitter<unknown>();
  private destroyEditor(): void {
    if (this.currentEditor) {
      this.currentEditor.destroyEditor();
      this.currentEditor = null;
    }
  }
}
