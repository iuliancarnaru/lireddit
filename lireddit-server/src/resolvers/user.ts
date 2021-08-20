import * as argon2 from 'argon2';
import { User } from '../entities/User';
import { MyContext } from '../types';
import {
  Mutation,
  Resolver,
  Field,
  Arg,
  Ctx,
  ObjectType,
  Query,
} from 'type-graphql';
import { COOKIE_NAME } from '../constants';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';

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
    const errors = validateRegister(input);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(input.password);
    const user = em.create(User, {
      email: input.email,
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
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes('@')
        ? {
            email: usernameOrEmail,
          }
        : {
            username: usernameOrEmail.toLowerCase(),
          }
    );

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

    const validPassword = await argon2.verify(user.password, password);

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

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      // remove session in redis
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        // clear cookie
        res.clearCookie(COOKIE_NAME);
        resolve(true);
      })
    );
  }

  // @Mutation(() => Boolean)
  // async forgotPassword(@Arg('email') email: string, @Ctx() { em }: MyContext) {
  // const user = await em.findOne(User, { email });
  //   return true;
  // }
}
