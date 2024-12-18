
/*
 * Module dependencies.
 */

import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { KnowledgeBase } from './knowledge-base';

export type ResourceType = 'FILE';

@Entity()
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 128 })
  type!: ResourceType

  @Column({ type: 'json' })
  metadata!: object

  @ManyToOne(() => KnowledgeBase, (knowledgeBase: KnowledgeBase) => knowledgeBase.resources, { nullable: false })
  knowledgeBase!: KnowledgeBase

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(resourceData?: { id?: string, type: ResourceType, metadata: object }) {
    if (!resourceData) {
      return;
    }

    if (resourceData.id) {
      this.id = resourceData.id;
    }

    this.type = resourceData.type;
    this.metadata = resourceData.metadata;
  }
}
