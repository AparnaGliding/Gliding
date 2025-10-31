export interface KnowledgeItem {
  id: string;
  title: string;
  type: 'Article' | 'Guide' | 'Tutorial';
  module: string;
  date: string;
  status: 'Draft' | 'Published' | 'Review';
}

export type FilterType = 'All' | 'Article' | 'FAQ';

export interface FreshdeskCategoryRequest {
  name: string;
  description: string;
}

export interface FreshdeskFolderRequest {
  name: string;
  description: string;
}

export interface ListCategoryModel {
  id: number;
  name: string;
}

export interface ListFolderModel {
  id: number;
  name: string;
}
