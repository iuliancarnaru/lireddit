import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

// m to n
// many to many
// user <> posts
// user <> join table <> posts
// user <> updoot <> post

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field()
  @Column()
  userId: number;

  @Field()
  @ManyToOne(() => User, (user) => user.updoots)
  user: User;

  @Field()
  @Column()
  postId: number;

  @Field()
  @ManyToOne(() => User, (posts) => posts.updoots)
  post: User;
}
