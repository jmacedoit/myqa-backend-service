
/*
 * Module dependencies.
 */

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';


export type PlanData = {
  monthlyQuestionCredits: number;
  monthlyResourceProcessingCharactersCredits: number;
};

@Entity()
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    length: 64,
    unique: true
  })
  type!: string;

  @Column('boolean')
  isDefault!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'json' })
  payload!: PlanData

  constructor(planData?: { type: string, isDefault: boolean }) {
    if (!planData) {
      return;
    }

    this.type = planData.type;
    this.isDefault = planData.isDefault;
  }
}
