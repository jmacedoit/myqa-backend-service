
/*
 * Module dependencies.
 */

import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { KnowledgeBase } from './knowledge-base';
import { User } from './user';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 64 })
  name!: string

  @Column('boolean')
  isPersonal!: boolean

  @ManyToMany(() => User, (user: User) => user.organizations)
  users!: User[];

  @OneToMany(() => KnowledgeBase, (knowledgeBase: KnowledgeBase) => knowledgeBase.organization)
  @JoinTable()
  knowledgeBases!: KnowledgeBase[]

  constructor(organizationData?: { id?: string, name: string, isPersonal: boolean }) {
    if (!organizationData) {
      return;
    }

    if (organizationData.id) {
      this.id = organizationData.id;
    }

    this.name = organizationData.name;
    this.isPersonal = organizationData.isPersonal;
  }
}
