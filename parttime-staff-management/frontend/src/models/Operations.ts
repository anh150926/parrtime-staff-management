/* file: frontend/src/models/Operations.ts */

export interface KnowledgeArticleDto {
  id?: number;
  title: string;
  content: string;
  category?: string;
  authorName?: string;
  createdAt?: string;
}

export interface TaskChecklistDto {
  id?: number;
  shiftTemplateId: number;
  shiftTemplateName?: string;
  taskDescription: string;
  isActive: boolean;
}

export interface TaskLogDto {
  id: number;
  taskId: number;
  userId: number;
  staffName: string;
  completedAt: string;
}
