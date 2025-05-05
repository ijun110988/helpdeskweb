import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { TicketComment } from './TicketComment';

@Entity()
export class Ticket {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column('text')
    description!: string;

    @Column({
        type: 'enum',
        enum: ['low', 'medium', 'high'],
        default: 'low'
    })
    priority!: 'low' | 'medium' | 'high';

    @Column({
        type: 'enum',
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    })
    status!: 'open' | 'in_progress' | 'resolved' | 'closed';

    @ManyToOne(() => User, { eager: true })
    @JoinColumn()
    user!: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn()
    assignedTo!: User | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => TicketComment, comment => comment.ticket, { cascade: true })
    comments!: TicketComment[];
}
