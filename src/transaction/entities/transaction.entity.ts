import { User } from '../../user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  @Column({
    type: 'enum',
    enum: ['Credit', 'Withdraw'],
  })
  type: 'Credit' | 'Withdraw';

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 12, scale: 2 })
  balanceAfterTransaction: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column()
  description: string;
}
