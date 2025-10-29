import { Component, HostListener, Input, Output, EventEmitter } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApplicationListingModel } from '../app-dashboard/app-dashboard.model';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() showAppDropdown: boolean = false;
  @Input() currentAppName: string = '';
  @Input() applications: ApplicationListingModel[] = [];
  @Input() tabs: Array<{ name: string; active: boolean }> = [];

  @Output() appSelected = new EventEmitter<ApplicationListingModel>();
  @Output() createNewApplication = new EventEmitter<void>();
  @Output() tabSelected = new EventEmitter<string>();

  isDropdownOpen: boolean = false;

  constructor(private router: Router) {}

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onSelectApp(app: ApplicationListingModel): void {
    this.appSelected.emit(app);
    this.isDropdownOpen = false;
  }

  onCreateNew(): void {
    this.createNewApplication.emit();
    this.isDropdownOpen = false;
  }

  onTabClick(tabName: string): void {
    this.tabSelected.emit(tabName);
    // Don't handle routing here - let the parent component handle it
    // The parent component has the context needed for proper routing
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.app-dropdown-container') && this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }
}
