
import React from 'react';
import { CommentType } from '@/types';
import { CommentItem } from './CommentItem';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentsListProps {
  comments: CommentType[] | undefined;
  jobId: string;
  loading?: boolean;
}

export const CommentsList: React.FC<CommentsListProps> = ({ comments, jobId, loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No hay comentarios aún. ¡Sé el primero en comentar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} jobId={jobId} />
      ))}
    </div>
  );
};
