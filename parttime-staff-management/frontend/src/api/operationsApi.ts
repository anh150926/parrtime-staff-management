import axiosClient from "./axiosClient";
import {
  KnowledgeArticleDto,
  TaskChecklistDto,
  TaskLogDto,
} from "../models/Operations";

export const operationsApi = {
  // --- Sổ tay (Knowledge Base) ---
  createArticle: async (
    data: KnowledgeArticleDto
  ): Promise<KnowledgeArticleDto> => {
    const response = await axiosClient.post<KnowledgeArticleDto>(
      "/operations/knowledge-base",
      data
    );
    return response.data;
  },
  getAllArticles: async (): Promise<KnowledgeArticleDto[]> => {
    const response = await axiosClient.get<KnowledgeArticleDto[]>(
      "/operations/knowledge-base"
    );
    return response.data;
  },
  updateArticle: async (
    id: number,
    data: KnowledgeArticleDto
  ): Promise<KnowledgeArticleDto> => {
    const response = await axiosClient.put<KnowledgeArticleDto>(
      `/operations/knowledge-base/${id}`,
      data
    );
    return response.data;
  },
  deleteArticle: async (id: number): Promise<void> => {
    await axiosClient.delete(`/operations/knowledge-base/${id}`);
  },

  // --- Checklist ---
  createChecklistTask: async (
    data: TaskChecklistDto
  ): Promise<TaskChecklistDto> => {
    const response = await axiosClient.post<TaskChecklistDto>(
      "/operations/checklists",
      data
    );
    return response.data;
  },
  getChecklistForTemplate: async (
    templateId: number
  ): Promise<TaskChecklistDto[]> => {
    const response = await axiosClient.get<TaskChecklistDto[]>(
      `/operations/checklists/template/${templateId}`
    );
    return response.data;
  },
  logTaskCompletion: async (taskId: number): Promise<TaskLogDto> => {
    const response = await axiosClient.post<TaskLogDto>(
      `/operations/checklists/log/${taskId}`
    );
    return response.data;
  },
};
