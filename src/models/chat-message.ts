
/*
 * Module dependencies.
 */

import { ChatSession } from './chat-session';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type SenderType = 'AI_ENGINE' | 'USER';

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ChatSession, (chatSession: ChatSession) => chatSession.chatMessages, { nullable: false })
  chatSession!: ChatSession

  @Column({ length: 32 })
  sender!: SenderType

  @Column({ type: 'longtext' })
  content!: string

  @Column({ type: 'json' })
  payload!: object

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(chatMessage?: { id?: string, sender: SenderType, content: string, payload: object }) {
    if (!chatMessage) {
      return;
    }

    if (chatMessage.id) {
      this.id = chatMessage.id;
    }

    this.sender = chatMessage.sender;
    this.content = chatMessage.content;
    this.payload = chatMessage.payload;
  }
}
