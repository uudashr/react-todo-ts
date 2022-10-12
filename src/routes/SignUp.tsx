import React from 'react';
import { 
  Typography, 
  Form, Input, Button, 
  Row, 
  Divider,
  Alert,
  message
} from 'antd';

import {
  BookFilled
} from '@ant-design/icons';

import './SignUp.css';

import Schema from 'async-validator';
import { useNavigate } from 'react-router-dom';
Schema.warning = function(){};

const { Title, Link } = Typography;

const validateMessages = {
  required: '${label} is required!', // eslint-disable-line no-template-curly-in-string
  types: {
    email: '${label} is not a valid email!', // eslint-disable-line no-template-curly-in-string
  },
};

type SignUpProps = {
  accountClient?: AccountClient;
}

type SignUpDetail = {
  email: string
  name: string
  password: string
};

export default function SignUp({ accountClient }: SignUpProps ) {
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const navigate = useNavigate();

  const handleSignUp = ({ email, name, password }: SignUpDetail) => {
    if (!accountClient) {
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    
    accountClient.signUp(email, name, password).then(() => {
      message.success('Registration succeed. Please log in!');
      navigate('/login');
    }).catch((err) => {
      setErrorMessage(err.message);
      setLoading(false);
    });
  }

  return (
    <Row 
      justify='center' 
      align='middle' 
      style={{ minHeight: '100vh' }}
    >
      <Form
        name='signUp'
        layout='vertical'
        style={{ 
          border: '1px solid #cccccc', 
          padding: '20px', 
          minWidth: '25rem'
        }}
        validateMessages={validateMessages}
        onFinish={handleSignUp}
      >
        <Title>
          <BookFilled /> Todo
        </Title>
        <Divider />
        <Title level={2}>
          Sign up
        </Title>
        { errorMessage && <Alert message={errorMessage} type='error' style={{ marginBottom: '1rem' }}/>}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, type: 'email' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true }
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Confirm password"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }

                return Promise.reject(new Error('The passwords not match!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit' loading={loading}>
            Sign me up
          </Button>
        </Form.Item>
        <Divider />
        <Row justify='center'>
          Already signed up? &nbsp; <Link href="/login">Go to login</Link>
        </Row>
      </Form>
    </Row>
    
  );
}

export interface AccountClient {
  signUp(email: string, name: string, password: string): Promise<void>;
}
