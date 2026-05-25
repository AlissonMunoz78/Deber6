import { Message, Room } from "@features/chat/domain/entities/Message";
import { IChatRepository } from "@features/chat/domain/repositories/IChatRepository";
import { supabase } from "@shared/infrastructure/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

const BUCKET = "chat-image";

export class SupabaseChatRepository implements IChatRepository {
  async getRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapRoom);
  }

  async createRoom(name: string, userId: string): Promise<Room> {
    const { data, error } = await supabase
      .from("rooms")
      .insert({ name, created_by: userId })
      .select()
      .single();
    if (error) throw error;
    return this.mapRoom(data);
  }

  async getMessages(roomId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select(
        "id, room_id, user_id, content, created_at, image_url, profiles(username)",
      )
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(50);
    if (error) throw error;
    return (data ?? []).map(this.mapMessage);
  }

  // Sube la imagen al bucket y devuelve la URL pública
  async uploadImage(localUri: string, userId: string): Promise<string> {
    const ext = localUri.split(".").pop() ?? "jpg";
    const fileName = `${userId}/${Date.now()}.${ext}`;

    const response = await fetch(localUri);
    let arrayBuf: ArrayBuffer | undefined;

    if (typeof response.arrayBuffer === "function") {
      arrayBuf = await response.arrayBuffer();
    } else {
      const blob = await response.blob();
      if (typeof blob.arrayBuffer === "function") {
        arrayBuf = await blob.arrayBuffer();
      }
    }

    if (!arrayBuf) {
      throw new Error(
        "No se pudo leer el archivo como ArrayBuffer. Actualiza el polyfill de fetch o instala expo-file-system para usar un fallback.",
      );
    }

    const uint8 = new Uint8Array(arrayBuf);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, uint8, {
        contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
        upsert: false,
      });

    if (error) throw new Error(`Error subiendo imagen: ${error.message}`);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  }

  async sendMessage(
    roomId: string,
    userId: string,
    content: string,
    imageUrl?: string,
  ): Promise<Message> {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        room_id: roomId,
        user_id: userId,
        content,
        image_url: imageUrl ?? null,
      })
      .select(
        "id, room_id, user_id, content, created_at, image_url, profiles(username)",
      )
      .single();
    if (error) throw error;
    return this.mapMessage(data);
  }

  subscribeToRoom(
    roomId: string,
    onMessage: (msg: Message) => void,
  ): () => void {
    const channelName = `room-${roomId}-${Date.now()}`;

    const channel: RealtimeChannel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: "" },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", payload.new.user_id)
            .single();

          onMessage({
            id: payload.new.id,
            roomId: payload.new.room_id,
            userId: payload.new.user_id,
            content: payload.new.content,
            createdAt: new Date(payload.new.created_at),
            authorUsername: profile?.username,
            imageUrl: payload.new.image_url ?? undefined,
          });
        },
      )
      .subscribe((status) => {
        console.log(`Realtime [${channelName}]:`, status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }

  private mapRoom = (raw: any): Room => ({
    id: raw.id,
    name: raw.name,
    createdBy: raw.created_by,
    createdAt: new Date(raw.created_at),
  });

  private mapMessage = (raw: any): Message => ({
    id: raw.id,
    roomId: raw.room_id,
    userId: raw.user_id,
    content: raw.content,
    createdAt: new Date(raw.created_at),
    authorUsername: raw.profiles?.username,
    imageUrl: raw.image_url ?? undefined,
  });
}
