
/*
 * Module dependencies.
 */

import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization';
import { User } from './user';


export type SpendingRecordPayload = {
  [key: string]: unknown;
};

export type SpendingRecordType = 'QUESTION_CREDITS_CONSUMED' | 'RESOURCE_PROCESSING_CHARACTERS_CREDITS_CONSUMED';

@Entity()
export class SpendingRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 64 })
  type!: SpendingRecordType

  @Column()
  quantity!: number

  @Column({ type: 'json' })
  payload!: SpendingRecordPayload

  @Column()
  spendingDate!: Date

  @ManyToOne(() => Organization)
  @JoinColumn()
  organization!: Organization

  @ManyToOne(() => User)
  @JoinColumn()
  user!: User

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(spendingRecord: { type: SpendingRecordType, quantity: number, payload?: SpendingRecordPayload, spendingDate: Date }) {
    if (!spendingRecord) {
      return;
    }

    this.type = spendingRecord.type;
    this.quantity = spendingRecord.quantity;
    this.spendingDate = spendingRecord.spendingDate;
    this.payload = spendingRecord.payload || {};
  }
}
