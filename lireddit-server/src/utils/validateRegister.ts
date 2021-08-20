import { UsernamePasswordInput } from '../resolvers/UsernamePasswordInput';

export const validateRegister = (input: UsernamePasswordInput) => {
  // or we can use a validation library
  if (!input.email.includes('@')) {
    return [
      {
        field: 'email',
        message: `invalid email address`,
      },
    ];
  }

  if (input.username.length <= 2) {
    return [
      {
        field: 'username',
        message: `length must be greater than 2`,
      },
    ];
  }

  if (input.username.includes('@')) {
    return [
      {
        field: 'username',
        message: `username can not include '@'`,
      },
    ];
  }

  if (input.password.length <= 4) {
    return [
      {
        field: 'password',
        message: `length must be greater than 4`,
      },
    ];
  }

  return null;
};
