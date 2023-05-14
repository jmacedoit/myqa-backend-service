
/*
 * Module dependencies.
 */

import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, VirtualColumn } from 'typeorm';
import { Organization } from './organization';
import { Resource } from './resource';

@Entity()
export class KnowledgeBase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 64 })
  name!: string

  @OneToMany(() => Resource, (resource: Resource) => resource.knowledgeBase)
  resources!: Resource[]

  @ManyToOne(() => Organization, (organization: Organization) => organization.knowledgeBases, { nullable: false })
  organization!: Organization

  @VirtualColumn({ query: (alias: any) => `SELECT COUNT(*) FROM resource WHERE knowledge_base_id = ${alias}.id` })
  resourcesCount!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(knowledgeBaseData?: { id?: string, name: string }) {
    if (!knowledgeBaseData) {
      return;
    }

    if (knowledgeBaseData.id) {
      this.id = knowledgeBaseData.id;
    }

    this.name = knowledgeBaseData.name;
  }
}
