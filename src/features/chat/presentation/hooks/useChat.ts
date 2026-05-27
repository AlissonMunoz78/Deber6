import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { GetMessagesUseCase } from '@features/chat/application/use-cases/GetMessagesUseCase';
import { SendMessageUseCase } from '@features/chat/application/use-cases/SendMessageUseCase';
import { SubscribeToRoomUseCase } from '@features/chat/application/use-cases/SubscribeToRoomUseCase';
import { Message } from '@features/chat/domain/entities/Message';
import { SupabaseChatRepository } from '@features/chat/infrastructure/repositories/SupabaseChatRepository';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

//const chatRepo = new AppwriteChatRepository();
const chatRepo        = new SupabaseChatRepository();
const getMessagesUseCase  = new GetMessagesUseCase(chatRepo);
const sendMessageUseCase  = new SendMessageUseCase(chatRepo);
const subscribeUseCase    = new SubscribeToRoomUseCase(chatRepo);

export function useChat(roomId: string) {
  const user        = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', roomId],
    queryFn:  () => getMessagesUseCase.execute(roomId),
    enabled:  !!user,
    staleTime: Infinity,
  });

  useEffect(() => {
    const unsubscribe = subscribeUseCase.execute(roomId, (newMsg) => {
      queryClient.setQueryData(['messages', roomId], (old: Message[] = []) => {
        const exists = old.some((m) => m.id === newMsg.id);
        return exists ? old : [...old, newMsg];
      });
    });
    return unsubscribe;
  }, [roomId]);

  const sendMutation = useMutation({
    mutationFn: ({ content, imageUrl }: { content: string; imageUrl?: string }) =>
      sendMessageUseCase.execute(roomId, user!.id, content, imageUrl),

    onMutate: async ({ content, imageUrl }) => {
      const tempMsg: Message = {
        id:             `temp-${Date.now()}`,
        roomId,
        userId:         user!.id,
        content,
        createdAt:      new Date(),
        authorUsername: user!.username,
        imageUrl,
      };
      queryClient.setQueryData(['messages', roomId], (old: Message[] = []) => [...old, tempMsg]);
      return { tempMsg };
    },

    onSuccess: (realMsg, _vars, context) => {
      queryClient.setQueryData(['messages', roomId], (old: Message[] = []) =>
        old.map((m) => (m.id === context?.tempMsg.id ? realMsg : m))
      );
    },

    onError: (_err, _vars, context) => {
      if (context?.tempMsg) {
        queryClient.setQueryData(['messages', roomId], (old: Message[] = []) =>
          old.filter((m) => m.id !== context.tempMsg.id)
        );
      }
    },
  });

  // Función que sube imagen si hay, luego envía
  const sendMessage = async (content: string, localImageUri?: string) => {
    let imageUrl: string | undefined;
    if (localImageUri) {
      imageUrl = await chatRepo.uploadImage(localImageUri, user!.id);
    }
    sendMutation.mutate({ content, imageUrl });
  };

  return {
    messages,
    sendMessage,
    isLoading,
    isSending: sendMutation.isPending,
  };
}