export class ChatModel {
  chatId: number;
  title: string;
  modifiedAt: string;
}

export interface ChatMessage {
  text?: string;
  isUser?: boolean;
  timestamp?: Date;
  openInFullView?: boolean;
  hasImages?: boolean;
  images?: { [key: string]: string };
  thoughtProcess?: string;
  filteredNodes?: string;
  time?: string;
  geminiApiMessage?: string;
  title?: string;
  pdfData?: any;
  showDetails?: boolean;
  textChunks?: { imageUrl: string; text: string; imageName?: string }[];
  pendingImages?: Set<string>;
  isThoughtProcess?: boolean;
  isVerificationStep?: boolean;
  supportingImages?: string[];
  content?: string;
  id?: string;
  messageId?: number;
  chatId?: number | undefined;
  userQuestion?: string;
}


export class ChatMessageModel {
  id: number;
  message: string;
  userType: string;
  createdAt: Date;
}

export interface ChatRequest {
  question: string;
  domain: string;
  accountId: string;
  userId: string;
  chatId: string;
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

export interface ArticleListResponseModel {
  id: number;
  question: string;
  createdAt: Date;
}


export interface DirectoryItemResponseModel {
  id: number;
  name: string;
  parentId: number;
  createdAt: Date;
  modifiedAt: Date;
  itemType: string;
  size: string;
  userId: number;
  applicationId: number;
  categoryId: number;
  url: string;
}
