
/*
 * Module dependencies.
 */

import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class EmailVerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 36 })
  token!: string

  @ManyToOne(() => User, { nullable: false })
  user!: User

  @Column({ type: 'decimal', precision: 10, scale: 0, default: 0 })
  ttl!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(tokenData?: { id?: string, token: string, ttl: number }) {
    if (!tokenData) {
      return;
    }

    if (tokenData.id) {
      this.id = tokenData.id;
    }

    this.token = tokenData.token;
    this.ttl = tokenData.ttl;
  }
}
