import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Ticket } from './Ticket';

@Entity('ticket_comments')
export class TicketComment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('text')
    comment!: string;

    @ManyToOne(() => Ticket, ticket => ticket.comments)
    ticket!: Ticket;

    @ManyToOne(() => User, user => user.comments)
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;
}
