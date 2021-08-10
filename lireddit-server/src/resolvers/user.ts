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
  @Mutation(() => UserResponse)
  async register(
    @Arg('input') input: UsernamePasswordInput,
    @Ctx() { em }: MyContext
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

    if (input.username.length <= 4) {
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
    await em.persistAndFlush(user);
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('input') input: UsernamePasswordInput,
    @Ctx() { em }: MyContext
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

    return { user };
  }
}
