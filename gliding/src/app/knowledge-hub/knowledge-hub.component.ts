import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnowledgeTableComponent } from './knowledge-table/knowledge-table.component';
import { KnowledgeItem, FilterType } from './knowledge-hub.model';

@Component({
  selector: 'app-knowledge-hub',
  standalone: true,
  imports: [FormsModule, KnowledgeTableComponent],
  templateUrl: './knowledge-hub.component.html',
  styleUrl: './knowledge-hub.component.scss'
})
export class KnowledgeHubComponent {
  searchTerm: string = '';
  activeFilter: FilterType = 'All';

  knowledgeItems: KnowledgeItem[] = [
    {
      id: '1',
      title: 'Refund Flow',
      type: 'Article',
      module: 'Billing',
      date: 'Today',
      status: 'Draft'
    }
  ];

  filteredItems: KnowledgeItem[] = [...this.knowledgeItems];

  setFilter(filter: FilterType): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.knowledgeItems];

    if (this.activeFilter !== 'All') {
      filtered = filtered.filter(item => item.type === this.activeFilter);
    }

    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.module.toLowerCase().includes(searchLower)
      );
    }

    this.filteredItems = filtered;
  }
}
