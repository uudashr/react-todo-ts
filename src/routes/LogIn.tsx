import React from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Typography,
  Row, Col, 
  Divider,
  Form, Input, Button,
  Alert,
  message,
} from 'antd';

import {
  BookFilled
} from '@ant-design/icons';

import './LogIn.css';

import { useAuth } from '../auth';

import Schema from 'async-validator';
Schema.warning = function(){};

const { Title, Link } = Typography;

const validateMessages = {
  required: '${label} is required!', // eslint-disable-line no-template-curly-in-string
  types: {
    email: '${label} is not a valid email!', // eslint-disable-line no-template-curly-in-string
  },
};

type LogInDetail = {
  email: string;
  password: string;
}

export default function LogIn() {
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogIn = ({ email, password }: LogInDetail) => {
    setLoading(true);
    setErrorMessage('');

    auth.logIn(email, password, (err) => {
      if (err) {
        setErrorMessage(err.message);
        setLoading(false);
      } else {
        message.success('Logged in');
        navigate('/todo', { replace: true });
      }
    });
  };

  return (
    <Row
      justify='center'
      style={{ minHeight: '50vh', padding: '5rem' }}
    >
      <Col>
        <Form
          name='login'
          layout='vertical'
          style={{ 
            border: '1px solid #cccccc', 
            padding: '20px', 
            minWidth: '25rem' 
          }}
          validateMessages={validateMessages}
          onFinish={handleLogIn}
        >
          <Title>
            <BookFilled /> Todo
          </Title>
          <Divider />
          <Title level={2}>
            Log in
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
            label="Password"
            name="password"
            rules={[
              { required: true }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit' loading={loading}>
              Log in
            </Button>
          </Form.Item>
          <Divider />
          <Row justify='center'>
            <Col>Do not have account? &nbsp; <Link href="/signup">Sign up</Link></Col>
          </Row>
        </Form>
      </Col>
    </Row>
  );
}
