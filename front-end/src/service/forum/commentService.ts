// src/service/forum/commentService.ts
import api from '../api';
import {
  CreateCommentPayload,
  ReplyCommentPayload,
  UpdateCommentPayload,
  RemoveCommentPayload,
} from '../../types/Forum';

export const createComment = async (payload: CreateCommentPayload) => {
  const response = await api.post('/comment/create', payload);
  return response.data;
};

export const replyComment = async (payload: ReplyCommentPayload) => {
  const response = await api.post('/comment/reply', payload);
  return response.data;
};

export const updateComment = async (payload: UpdateCommentPayload) => {
  const response = await api.patch('/comment/edit', payload);
  return response.data;
};

export const removeComment = async (payload: RemoveCommentPayload) => {
  const response = await api.delete('/comment/remove', { data: payload });
  return response.data;
};

export const getComments = async (postId: number, page: number, limit: number) => {
  const response = await api.get(`/comment`, {
    params: { postId, page, limit }
  });
  console.log("Raw API response:", response);
  return response.data.data;  // Trả về mảng comment nằm trong response.data.data
};


