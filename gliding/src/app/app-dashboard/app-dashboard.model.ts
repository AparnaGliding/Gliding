export interface App {
  id: number;
  name: string;
  url: string;
  domain: string;
  email?: string;
  password?: string;
  username?: string;
  crawlType?: string;
}

export interface ApplicationListingModel {
  id: number;
  name: string;
  url: string;
  domain:string;
  crawlType: string;
}

export interface ArticleListResponseModel{
  id: number;
  question: string;
  createdAt: Date;
}

export interface ApplicationModuleModel {
 id: number;
 moduleName: string;
 moduleUrl: string;
 moduleSummary: string;
 applicationId: number;
 crawlStatus: string;
 createdAt: Date;
 modifiedAt: Date;
 version: number;
}

export interface EnhancedApplicationData extends ApplicationListingModel {
  modules?: ApplicationModuleModel[];
  moduleCount?: number;
  articlesCount?: number;
  totalModules?: number;
  totalArticles?: number;
  lastUpdated?: string;
}
