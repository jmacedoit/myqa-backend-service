
/*
 * Module dependencies.
 */

import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization';
import { Plan } from './plan';


export type PlanData = {
  monthlyQuestionCredits: number;
  monthlyResourceProcessingCharactersCredits: number;
};

@Entity()
export class OrganizationPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Organization)
  @JoinColumn()
  organization!: Organization

  @OneToOne(() => Plan)
  @JoinColumn()
  plan!: Plan

  @Column()
  startDate!: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(organizationPlanData: { startDate: Date }) {
    if (!organizationPlanData) {
      return;
    }

    this.startDate = organizationPlanData.startDate;
  }
}
