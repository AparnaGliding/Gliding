import { Component, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  activeItem = 'apps';
  isExpanded = true;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  setActiveItem(item: string) {
    this.activeItem = item;
  }

  isActive(item: string): boolean {
    return this.activeItem === item;
  }

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
    
    // Add/remove body class for global layout adjustments
    if (this.isExpanded) {
      this.renderer.removeClass(this.document.body, 'sidebar-collapsed');
    } else {
      this.renderer.addClass(this.document.body, 'sidebar-collapsed');
    }
  }
}
