import {ListCategoryModel} from '../knowledge-hub.model';

export enum ReferencableType {
  ARTICLE = 'ARTICLE',
  FAQ = 'FAQ'
}

export enum DirectoryItemType {
  FOLDER = 'FOLDER',
  FILE = 'FILE'
}

export interface CategoryListResponseModel {
  id: number;
  name: string;
  type: ReferencableType;
  description: string;
  createdAt: Date;
  modifiedAt: Date;
  applicationId: number;
  userId: number;
}

export interface DirectoryItemResponseModel {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: Date;
  modifiedAt: Date;
  itemType: DirectoryItemType;
  size: string;
  userId: number;
  applicationId: number;
  categoryId: number;
  url: string;
}

export interface TreeNode {
  id: number;
  name: string;
  type: 'category' | 'folder' | 'file';
  referencableType?: ReferencableType;
  parentId?: number | null;
  categoryId?: number;
  children?: TreeNode[];
  expanded?: boolean;
  loading?: boolean;
}

export interface ArticleContent {
  id: number;
  title: string;
  content: string;
  type: ReferencableType;
  status: string;
  createdAt: Date;
  modifiedAt: Date;
  author?: string;
}


export interface FAQ {
  id: number;
  question: string;
  answer: string;
  applicationModuleId: number | null;
  createdAt: Date;
  modifiedAt: Date;
  version: number;
  userId: number;
}

export interface GenerateFaqModel {
  applicationId: number;
  moduleId: number;
  count: number;
  prompt: string;
  categoryId: number;
  createNewCategory: boolean;
  categoryModel: CategoryModel;
  userId: number;
}

export interface CategoryModel{
  name: string;
  description: string;
  applicationId: number;
  type: ReferencableType;
}
