import React from 'react';
import { Formik, Form } from 'formik';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';

interface RegisterProps {}

const Register: React.FC<RegisterProps> = ({}) => {
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={(values) => {
          console.log(values);
        }}
      >
        {({ values, handleChange }) => (
          <Form>
            <InputField
              name="username"
              label="Username"
              placeholder="username"
            />
            <InputField
              name="password"
              label="Password"
              placeholder="password"
              type='password'
            />
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
