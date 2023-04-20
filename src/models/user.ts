
/*
 * Module dependencies.
 */

import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Organization } from './organization';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 64 })
  displayName!: string

  @Column({ length: 128, unique: true })
  email!: string

  @Column({ length: 128 })
  password!: string

  @ManyToMany(() => Organization, (organization: Organization) => organization.users)
  @JoinTable()
  organizations!: Organization[]

  @Column('boolean')
  acceptedTerms!: boolean

  constructor(userData?: { id?: string, displayName: string, email: string, hashedPassword: string, acceptedTerms: boolean }) {
    if (!userData) {
      return;
    }

    if (userData.id) {
      this.id = userData.id;
    }

    this.displayName = userData.displayName;
    this.email = userData.email;
    this.password = userData.hashedPassword;
    this.acceptedTerms = userData.acceptedTerms;
  }
}
