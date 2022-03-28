import { backend } from '~/services';

import { CreateReview, GetReviews, Review, UpdateReview } from './reviews.d';

export const getReviews = async () => {
  return await backend.get<GetReviews>('/api/movies');
};

export const createReview = async (data: CreateReview) => {
  return await backend.post<Review>('/api/movies', data);
};

export const getReviewById = async (id: string) => {
  return await backend.get<Review>(`/api/movies/${id}`);
};

export const updateReviewById = async ({ id, data }: { id: string; data: UpdateReview }) => {
  return await backend.put<Review>(`/api/movies/${id}`, data);
};

export const deleteReviewById = async (id: string) => {
  return await backend.delete<true>(`/api/movies/${id}`);
};
