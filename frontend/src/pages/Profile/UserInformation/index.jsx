import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Descriptions, Space, Input, Typography, message } from 'antd';
import { apiBaseUrl } from '@/assets/js/config.js';

const UserInformation = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [user, setUser] = useState(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {}
  );

  const getUser = () => {
    fetch(`${apiBaseUrl}/user/${user.id}`, {
      method: 'GET',
      headers: {
        Authorization: token,
      },
    })
      .then(response => response.json())
      .then(response => {
        if (response.success) {
          setUser(response.data);
          // Save user information to local storage
          localStorage.setItem('user', JSON.stringify(response.data));
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
        message.error('An error occurred while fetching user information.');
      });
  };

  // Redirect to login if not logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
    } else {
      getUser();
    }
  }, [navigate]);

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card title="User Information" size="default" headStyle={{ fontSize: '20px' }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="User ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="User Type">{user.user_type}</Descriptions.Item>
          <Descriptions.Item label="Account Status">{user.account_status}</Descriptions.Item>
          <Descriptions.Item label="Last Online">{user.last_online}</Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
};

export default UserInformation;
