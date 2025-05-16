
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle } from 'lucide-react';
import { CommentType, ReplyType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/contexts/JobContext';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';

type CommentItemProps = {
  comment: CommentType;
  jobId: string;
};

export const CommentItem: React.FC<CommentItemProps> = ({ comment, jobId }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [localReplies, setLocalReplies] = useState<ReplyType[]>(comment.replies || []);
  
  const { currentUser } = useAuth();
  const { addReplyToComment } = useJobs();

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !currentUser) return;
    
    setIsSubmittingReply(true);
    try {
      if (currentUser) {
        // Send the reply to the backend API
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await axios.post(
          `${API_URL}/jobs/${jobId}/comments/${comment.id}/replies`,
          { content: replyContent },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        console.log('Reply response:', response.data);
        
        if (response.data.success && response.data.reply) {
          // Format the reply to match the expected structure
          const newReply: ReplyType = {
            ...response.data.reply,
            text: response.data.reply.content,
            timestamp: new Date(response.data.reply.createdAt).getTime()
          };
          
          // Update local state with the new reply
          setLocalReplies(prev => [...prev, newReply]);
          
          // Add the reply to the comment in the global state
          await addReplyToComment(jobId, comment.id, replyContent, currentUser);
          
          setReplyContent('');
          setShowReplyForm(false);
          toast({
            title: "Respuesta enviada",
            description: "Tu respuesta ha sido publicada correctamente"
          });
        } else {
          throw new Error('Failed to send reply');
        }
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la respuesta"
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Use either the locally managed replies or the ones from props
  const displayReplies = localReplies.length > 0 ? localReplies : (comment.replies || []);

  return (
    <div className="space-y-3">
      {/* Comentario principal */}
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.userPhoto} alt={comment.userName} />
          <AvatarFallback className="bg-wfc-purple-medium text-white">
            {comment.userName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className="font-medium text-sm">{comment.userName}</h4>
            <span className="text-xs text-gray-500">
              {formatDate(comment.timestamp)} {formatTime(comment.timestamp)}
            </span>
          </div>
          <p className="text-gray-700 text-sm mt-1">{comment.text || comment.content}</p>
          
          {currentUser && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs text-wfc-purple mt-1 flex items-center hover:text-wfc-purple-dark transition-colors duration-200 transform hover:scale-[1.02]"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              {showReplyForm ? 'Cancelar' : 'Responder'}
            </button>
          )}
        </div>
      </div>

      {/* Formulario de respuesta */}
      {showReplyForm && (
        <div className="ml-11 mt-2">
          <Textarea
            placeholder="Escribe tu respuesta..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-[80px] text-sm"
          />
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              variant="outline"
              className="mr-2 hover:bg-gray-100 transition-colors duration-200 transform hover:scale-[1.02]"
              onClick={() => setShowReplyForm(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitReply}
              disabled={isSubmittingReply || !replyContent.trim()}
              className="bg-wfc-purple hover:bg-wfc-purple-medium transition-colors duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmittingReply ? 'Enviando...' : 'Responder'}
            </Button>
          </div>
        </div>
      )}

      {/* Respuestas */}
      {displayReplies.length > 0 && (
        <div className="ml-11 space-y-3 border-l-2 border-gray-100 pl-3">
          {displayReplies.map((reply: ReplyType) => (
            <div key={reply.id} className="flex space-x-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={reply.userPhoto} alt={reply.userName} />
                <AvatarFallback className="bg-wfc-purple-light text-white text-xs">
                  {reply.userName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-medium text-xs">{reply.userName}</h4>
                  <span className="text-xs text-gray-500">
                    {formatDate(reply.timestamp)} {formatTime(reply.timestamp)}
                  </span>
                </div>
                <p className="text-gray-700 text-xs mt-1">{reply.text || reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
