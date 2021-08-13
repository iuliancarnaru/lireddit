import * as argon2 from 'argon2';
import { User } from '../entities/User';
import { MyContext } from '../types';
import {
  Mutation,
  Resolver,
  InputType,
  Field,
  Arg,
  Ctx,
  ObjectType,
  Query,
} from 'type-graphql';

// using @InputType instead of multiple @Arg
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('input') input: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // or we can use a validation library
    if (input.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: `length must be greater than 2`,
          },
        ],
      };
    }

    if (input.password.length <= 4) {
      return {
        errors: [
          {
            field: 'password',
            message: `length must be greater than 4`,
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(input.password);
    const user = em.create(User, {
      username: input.username.toLowerCase(),
      password: hashedPassword,
    });

    try {
      await em.persistAndFlush(user);
    } catch (err) {
      // duplicate user error
      if (err.code === '23505' || err.detail.includes('already exists')) {
        return {
          errors: [
            {
              field: 'username',
              message: `username already taken`,
            },
          ],
        };
      }
    }

    // log you in after registering
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('input') input: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      username: input.username.toLowerCase(),
    });

    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: `user not found`,
          },
        ],
      };
    }

    const validPassword = await argon2.verify(user.password, input.password);

    if (!validPassword) {
      return {
        errors: [
          {
            field: 'password',
            message: `password is incorrect`,
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }
}
