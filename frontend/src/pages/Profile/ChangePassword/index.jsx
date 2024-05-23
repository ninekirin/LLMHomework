import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Space, Card, Divider, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { apiBaseUrl } from '@/assets/js/config.js';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [user, setUser] = useState({
    id: '',
    username: '',
    email: '',
    user_type: '',
    account_status: '',
    last_online: '',
  });

  // Redirect to login if not logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
    } else {
      setUser(JSON.parse(localStorage.getItem('user')));
    }
  }, [navigate]);

  const onFinish = values => {
    fetch(`${apiBaseUrl}/user/${user.id}/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token'),
      },
      body: JSON.stringify({
        old_password: values.old_password,
        new_password: values.new_password,
      }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success(response.message);
          form.resetFields();
        } else {
          message.error(response.message);
          // NO_TOKEN, INVALID_TOKEN, EXPIRED_TOKEN: redirect to login
          if (
            response.code === 'NO_TOKEN' ||
            response.code === 'INVALID_TOKEN' ||
            response.code === 'EXPIRED_TOKEN'
          ) {
            navigate('/login', {
              state: { navBackMsg: 'Login expired. Please login again.' },
            });
          }
        }
      })
      .catch(error => {
        message.error('An error occurred while changing password.');
      });
  };

  return (
    <>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card title="Change Password" size="default" headStyle={{ fontSize: '20px' }}>
          <p>
            Please informed: Password must be at least 8 characters long and contain at least one
            number, one uppercase letter, and one lowercase letter.
          </p>
          <Divider />
          <Form form={form} name="Change Password" onFinish={onFinish} scrollToFirstError>
            <Form.Item
              name="old_password"
              prefix={<LockOutlined className="site-form-item-icon" style={{ color: '#1890ff' }} />}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Please input your old password!',
                },
              ]}
              hasFeedback
            >
              <Input.Password
                type="password"
                prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                placeholder="Enter your old password"
              />
            </Form.Item>
            <Form.Item
              name="new_password"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Please input your new password!',
                },
              ]}
              hasFeedback
            >
              <Input.Password
                type="password"
                prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                placeholder="Enter your new password"
              />
            </Form.Item>
            <Form.Item
              name="new_password_confirm"
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Please confirm your password!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('new_password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('The passwords that you entered do not match!')
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                type="password"
                prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                placeholder="Confirm password"
              />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </>
  );
};
export default ChangePassword;
