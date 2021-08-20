import { InputType, Field } from 'type-graphql';

// using @InputType instead of multiple @Arg
@InputType()
export class UsernamePasswordInput {
  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  password: string;
}
