import { NextPage } from 'next';
import React from 'react';

export const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  return <div>token is : {token}</div>;
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default ChangePassword;
