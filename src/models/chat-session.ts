
/*
 * Module dependencies.
 */

import { ChatMessage } from './chat-message';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user: User) => user.chatSessions, { nullable: false })
  user!: User

  @OneToMany(() => ChatMessage, (chatMessage: ChatMessage) => chatMessage.chatSession)
  chatMessages?: ChatMessage[]

  @Column({ type: 'json' })
  metadata!: object

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(chatSessionData?: { id?: string, metadata: object }) {
    if (!chatSessionData) {
      return;
    }

    if (chatSessionData.id) {
      this.id = chatSessionData.id;
    }

    this.metadata = chatSessionData.metadata;
  }
}
