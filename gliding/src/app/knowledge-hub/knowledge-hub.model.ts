export interface KnowledgeItem {
  id: string;
  title: string;
  type: 'Article' | 'Guide' | 'Tutorial';
  module: string;
  date: string;
  status: 'Draft' | 'Published' | 'Review';
}

export type FilterType = 'All' | 'Article' | 'FAQ';