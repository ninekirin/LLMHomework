import { apiBaseUrl, siteName, siteDescription } from '@/assets/js/config.js';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import 'antd/dist/antd.css';
import { Link, useNavigate } from 'react-router-dom';
import './index.css';

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const onFinish = values => {
    fetch(`${apiBaseUrl}/user/register-old`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: values.username,
        email: values.email,
        password: values.password,
      }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success(response.message);
          navigate('/login', { state: { email: values.email } });
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
      .catch(err => {
        message.error('An error occurred while registering.');
      });
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
            <span className="title-span">Register</span>
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
          <Form.Item name="username" rules={[{ required: true, message: 'Username is required.' }]}>
            <Input
              prefix={<UserOutlined className="site-form-item-icon" style={{ color: '#1890ff' }} />}
              placeholder="Username"
              allowClear
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'E-Mail is required.' },
              { type: 'email', message: 'The E-Mail is invalid.' },
            ]}
          >
            <Input
              prefix={<MailOutlined className="site-form-item-icon" style={{ color: '#1890ff' }} />}
              placeholder="E-Mail"
              allowClear
              size="large"
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Password is required.' }]}>
            <Input.Password
              allowClear
              size="large"
              prefix={<LockOutlined className="site-form-item-icon" style={{ color: '#1890ff' }} />}
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
                  return Promise.reject(new Error('The passwords that you entered do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              allowClear
              size="large"
              prefix={<LockOutlined className="site-form-item-icon" style={{ color: '#1890ff' }} />}
              placeholder="Confirm Password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="register-form-button"
              style={{ width: '100%' }}
            >
              Register
            </Button>
          </Form.Item>
        </Form>
        <Link to="/login" style={{ display: 'flex', justifyContent: 'center', fontSize: '18px' }}>
          Already have an account? Login
        </Link>
      </div>
      <div className="footer">
        <div className="footer-top" style={{ color: 'rgba(0, 0, 0, 0.45)', marginBottom: '8px' }}>
          <div className="site-desc">{siteName}</div>
        </div>
      </div>
    </div>
  );
};

export default Register;
