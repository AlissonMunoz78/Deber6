// MIGRACIÓN: Reemplaza SupabaseChatRepository sin tocar ninguna otra capa
// Solo cambia la inyección de dependencia en los hooks

import { Message, Room } from '@features/chat/domain/entities/Message';
import { IChatRepository } from '@features/chat/domain/repositories/IChatRepository';
import { Client, Databases, ID, Query, RealtimeResponseEvent } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

const DB_ID       = process.env.EXPO_PUBLIC_APPWRITE_DB_ID!;
const ROOMS_COL   = 'rooms';
const MESSAGES_COL = 'messages';

export class AppwriteChatRepository implements IChatRepository {
  async getRooms(): Promise<Room[]> {
    const res = await databases.listDocuments(DB_ID, ROOMS_COL, [
      Query.orderDesc('$createdAt'),
    ]);
    return res.documents.map(this.mapRoom);
  }

  async createRoom(name: string, userId: string): Promise<Room> {
    const doc = await databases.createDocument(DB_ID, ROOMS_COL, ID.unique(), {
      name,
      created_by: userId,
    });
    return this.mapRoom(doc);
  }

  async getMessages(roomId: string): Promise<Message[]> {
    const res = await databases.listDocuments(DB_ID, MESSAGES_COL, [
      Query.equal('room_id', roomId),
      Query.orderAsc('$createdAt'),
      Query.limit(50),
    ]);
    return res.documents.map(this.mapMessage);
  }

  async sendMessage(roomId: string, userId: string, content: string): Promise<Message> {
    const doc = await databases.createDocument(DB_ID, MESSAGES_COL, ID.unique(), {
      room_id: roomId,
      user_id: userId,
      content,
    });
    return this.mapMessage(doc);
  }

  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void {
    const unsubscribe = client.subscribe(
      `databases.${DB_ID}.collections.${MESSAGES_COL}.documents`,
      (response: RealtimeResponseEvent<any>) => {
        if (
          response.events.includes('databases.*.collections.*.documents.*.create') &&
          response.payload.room_id === roomId
        ) {
          onMessage(this.mapMessage(response.payload));
        }
      }
    );
    return unsubscribe;
  }

  private mapRoom = (doc: any): Room => ({
    id:        doc.$id,
    name:      doc.name,
    createdBy: doc.created_by,
    createdAt: new Date(doc.$createdAt),
  });

  private mapMessage = (doc: any): Message => ({
    id:              doc.$id,
    roomId:          doc.room_id,
    userId:          doc.user_id,
    content:         doc.content,
    createdAt:       new Date(doc.$createdAt),
    authorUsername:  doc.author_username,
  });
}