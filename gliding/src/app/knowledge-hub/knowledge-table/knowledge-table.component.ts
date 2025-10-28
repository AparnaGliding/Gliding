import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnowledgeItem } from '../knowledge-hub.model';

@Component({
  selector: 'app-knowledge-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './knowledge-table.component.html',
  styleUrl: './knowledge-table.component.scss'
})
export class KnowledgeTableComponent {
  @Input() knowledgeItems: KnowledgeItem[] = [];
}
