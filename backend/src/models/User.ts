import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Ticket } from './Ticket';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column({
        type: 'enum',
        enum: ['user', 'admin'],
        default: 'user'
    })
    role!: 'user' | 'admin';

    @OneToMany(() => Ticket, ticket => ticket.user)
    tickets!: Ticket[];

    @OneToMany(() => Ticket, ticket => ticket.assignedTo)
    assignedTickets!: Ticket[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Virtual property untuk isAdmin
    get isAdmin(): boolean {
        return this.role === 'admin';
    }
    comments: any;
}
