import { apiBaseUrl, siteName, siteDescription } from '@/assets/js/config.js';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Result, message } from 'antd';
import 'antd/dist/antd.css';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './index.css';

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [stage, setStage] = useState(1); // Stage 1: Email Verification, Stage 2: Back to Login Page, Stage 3: Complete Registration
  const [loading, setLoading] = useState(false);
  const [stage2_status, setStage2Status] = useState({
    code: 'email_sent',
    status: 'success',
    title: 'Email Sent',
    subTitle: 'Please check your email for the verification link.',
    buttonText: 'Back to Registration Page',
  });

  useEffect(() => {
    const urlParams = new URL(window.location.href);
    const vCode = urlParams?.searchParams?.get('code');
    if (vCode) {
      fetch(`${apiBaseUrl}/user/vcode-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vCode: vCode }),
      })
        .then(response => response.json())
        .then(response => {
          if (response.success) {
            setStage(3);
            form.setFieldsValue({ email: response.data.email });
          } else {
            setStage(2);
            setStage2Status({
              code: 'verification_failed',
              status: 'warning',
              title: 'Verification Failed',
              subTitle: response.message,
              buttonText: 'Back to Registration Page',
            });
          }
        })
        .catch(() => {
          setStage(2);
          setStage2Status({
            code: 'verification_failed',
            status: 'warning',
            title: 'Verification Failed',
            subTitle: 'The verification code is invalid or expired.',
            buttonText: 'Back to Registration Page',
          });
        });
    }
  }, [form]);

  const requestVerificationEmail = values => {
    setLoading(true);
    fetch(`${apiBaseUrl}/user/email-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: values.email }),
    })
      .then(response => response.json())
      .then(response => {
        if (response.success) {
          setLoading(false);
          setStage(2);
          message.success(response.message);
        } else {
          setLoading(false);
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
      .catch(err => {
        setLoading(false);
        message.error('Failed to send verification email.');
      });
  };

  const registerUser = values => {
    setLoading(true);
    const urlParams = new URL(window.location.href);
    fetch(`${apiBaseUrl}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vCode: urlParams?.searchParams?.get('code'),
        username: values.username,
        password: values.password,
      }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setLoading(false);
          setStage(2);
          setStage2Status({
            code: 'registration_success',
            status: 'success',
            title: 'Successfully Registered',
            subTitle: response.message,
            buttonText: 'Back to Login Page',
          });
          message.success(response.message);
          // navigate('/login', { state: { email: values.email } });
        } else {
          setLoading(false);
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
        setLoading(false);
        message.error('An error occurred while registering.');
      });
  };

  const onFinish = values => {
    if (stage === 1) {
      requestVerificationEmail(values);
    } else if (stage === 2) {
      if (stage2_status.code === 'email_sent') {
        setStage(1);
      } else if (stage2_status.code === 'verification_failed') {
        // clear the verification code
        const urlParams = new URL(window.location.href);
        urlParams.searchParams.delete('code');
        setStage(1);
      } else if (stage2_status.code === 'registration_success') {
        navigate('/login', { state: { email: values.email } });
      }
    } else if (stage === 3) {
      registerUser(values);
    }
  };

  return (
    <div className="app">
      <div
        style={{
          width: '100%',
          height: '40px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      />
      <div
        style={{
          flex: '1',
          height: '100%',
          margin: '0 auto',
          width: '328px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              paddingTop: '20px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <span className="title-span">{siteName} Register</span>
          </div>
          <div
            style={{
              margin: '20px 0px 40px 0px',
              color: 'rgba(0, 0, 0, 0.45)',
            }}
          >
            {siteDescription}
          </div>
        </div>
        <Form form={form} name="normal_register" className="register-form" onFinish={onFinish}>
          {stage === 1 && (
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'E-Mail is required.' },
                { type: 'email', message: 'The E-Mail is invalid.' },
              ]}
            >
              <Input
                prefix={
                  <MailOutlined className="site-form-item-icon" style={{ color: '#1890ff' }} />
                }
                placeholder="E-Mail"
                allowClear
                size="large"
              />
            </Form.Item>
          )}
          {stage === 2 && (
            <Card>
              <Result
                status={stage2_status.status}
                title={stage2_status.title}
                subTitle={stage2_status.subTitle}
              />
            </Card>
          )}
          {stage === 3 && (
            <>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'E-Mail is required.' },
                  { type: 'email', message: 'The E-Mail is invalid.' },
                ]}
              >
                <Input
                  prefix={
                    <MailOutlined className="site-form-item-icon" style={{ color: '#1890ff' }} />
                  }
                  placeholder="E-Mail"
                  allowClear
                  size="large"
                  disabled={stage === 2 || stage === 3}
                />
              </Form.Item>
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Username is required.' }]}
              >
                <Input
                  prefix={
                    <UserOutlined className="site-form-item-icon" style={{ color: '#1890ff' }} />
                  }
                  placeholder="Username"
                  allowClear
                  size="large"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Password is required.' }]}
              >
                <Input.Password
                  allowClear
                  size="large"
                  prefix={
                    <LockOutlined className="site-form-item-icon" style={{ color: '#1890ff' }} />
                  }
                  type="password"
                  placeholder="Password"
                />
              </Form.Item>
              <Form.Item
                name="confirm"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
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
                  allowClear
                  size="large"
                  prefix={
                    <LockOutlined className="site-form-item-icon" style={{ color: '#1890ff' }} />
                  }
                  placeholder="Confirm Password"
                />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="register-form-button"
              style={{ width: '100%' }}
              size="large"
              loading={loading}
            >
              {stage === 1 && 'Send Verification Email'}
              {stage === 2 && stage2_status.buttonText}
              {stage === 3 && 'Register'}
            </Button>
          </Form.Item>
        </Form>
        <Link to="/login" style={{ display: 'flex', justifyContent: 'center', fontSize: '18px' }}>
          Already have an account? Login
        </Link>
      </div>
      <div className="footer">
        <div className="footer-top" style={{ color: 'rgba(0, 0, 0, 0.45)', marginBottom: '8px' }}>
          <div className="site-name">{siteName}</div>
        </div>
      </div>
    </div>
  );
};

export default Register;
