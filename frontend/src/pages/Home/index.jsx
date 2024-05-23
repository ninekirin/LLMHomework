import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Space } from 'antd';
import {
  UnorderedListOutlined,
  SearchOutlined,
  AuditOutlined,
  ExperimentOutlined,
  BarsOutlined,
  PullRequestOutlined,
} from '@ant-design/icons';
import { siteName } from '@/assets/js/config.js';

const Home = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [user, setUser] = useState({
    id: '',
    username: '',
    email: '',
    user_type: '',
    account_status: '',
    last_online: '',
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
    } else {
      setUser(JSON.parse(localStorage.getItem('user')));
    }
  }, [navigate]);

  const gridStyle = {
    width: isMobile ? '100%' : '25%',
    textAlign: 'center',
  };

  const renderStudentAccess = () => (
    <Card title="Quick Access For Students">
      <Card.Grid style={gridStyle}>
        <Link to="/helptopic/list">
          <Space>
            <UnorderedListOutlined />
            Search Help Topics
          </Space>
        </Link>
      </Card.Grid>
    </Card>
  );

  const renderTeacherAccess = () => (
    <Card title="Quick Access For Teachers">
      <Card.Grid style={gridStyle}>
        <Link to="/question/search">
          <Space>
            <SearchOutlined />
            Search Assignment Questions
          </Space>
        </Link>
      </Card.Grid>

      <Card.Grid style={gridStyle}>
        <Link to="/question/list">
          <Space>
            <BarsOutlined />
            List Assignment Questions
          </Space>
        </Link>
      </Card.Grid>

      <Card.Grid style={gridStyle}>
        <Link to="/experiment/list">
          <Space>
            <ExperimentOutlined />
            My Personal Experiments
          </Space>
        </Link>
      </Card.Grid>

      <Card.Grid style={gridStyle}>
        <Link to="/request/create">
          <Space>
            <PullRequestOutlined />
            Create New Request
          </Space>
        </Link>
      </Card.Grid>
    </Card>
  );

  const renderAdminAccess = () => (
    <Card title="Quick Access For Admins">
      <Card.Grid style={gridStyle}>
        <Space>
          <Link to="/management/requests">
            <Space>
              <AuditOutlined />
              Handle User Requests
            </Space>
          </Link>
        </Space>
      </Card.Grid>
      <Card.Grid style={gridStyle}>
        <Link to="/management/users">
          <Space>
            <AuditOutlined />
            Manage Users
          </Space>
        </Link>
      </Card.Grid>
    </Card>
  );

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card title="Dashboard" size="default" headStyle={{ fontSize: '20px' }}>
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Card title="User Information">
            <p>
              Welcome <b>{user.username}</b> to {siteName}.
            </p>
            <p>
              Your current role is <b>{user.user_type}</b>.
            </p>
            <p>
              Your account is <b>{user.account_status}</b>.
            </p>
            <p>
              Last online: <b>{user.last_online}</b>
            </p>
          </Card>
          {['TEACHER', 'ADMIN', 'STUDENT'].includes(user.user_type) && renderStudentAccess()}
          {['TEACHER', 'ADMIN'].includes(user.user_type) && renderTeacherAccess()}
          {['ADMIN'].includes(user.user_type) && renderAdminAccess()}
        </Space>
      </Card>
    </Space>
  );
};

export default Home;
