import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Table, Space, Card, Typography, Button, message } from 'antd';
import { EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { apiBaseUrl } from '@/assets/js/config.js';

const { Title } = Typography;

const ListPersonalExperiment = () => {
  const navigate = useNavigate();
  const urlParams = new URL(window.location.href);
  // convert URLSearchParams to object
  const params = Object.fromEntries(urlParams.searchParams);
  const token = localStorage.getItem('token');

  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Experiment Text',
      dataIndex: 'experiment_text',
      render: text => (text.length > 100 ? `${text.substring(0, 100)}...` : text),
    },
    // {
    //   title: 'User ID',
    //   dataIndex: 'user_id',
    // },
    {
      title: 'Question ID',
      dataIndex: 'question_id',
      width: 150,
    },
    {
      title: 'Action',
      key: 'operation',
      width: 150,
      render: (text, experiment) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/experiment/view?id=${experiment.id}`)}
            />
          </Tooltip>
          <Tooltip title="Request Submission">
            <Button
              type="default"
              icon={<UploadOutlined />}
              onClick={() => navigate(`/request/create?experiment_id=${experiment.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const fetchData = params => {
    setLoading(true);
    const query = Object.entries(params)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    fetch(`${apiBaseUrl}/experiments?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setExperiments(response.data.experiments);
          setTableParams(prev => ({
            ...prev,
            pagination: {
              current: response.data.pagination.current,
              pageSize: response.data.pagination.pageSize,
              total: response.data.pagination.total,
            },
          }));
          setLoading(false);
        } else {
          message.error(response.message);
          // NO_TOKEN, INVALID_TOKEN, EXPIRED_TOKEN: redirect to login
          if (
            response.code === 'NO_TOKEN' ||
            response.code === 'INVALID_TOKEN' ||
            response.code === 'EXPIRED_TOKEN'
          ) {
            navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
          }
        }
      });
  };

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
    } else {
      fetchData({ current: 1, pageSize: 10 }); // Initial fetch
    }
  }, []);

  return (
    <Card title="List of Personal Experiments" headStyle={{ fontSize: '20px' }}>
      <Title level={4} style={{ textAlign: 'center' }}>
        My Personal Experiments
      </Title>
      <p style={{ textAlign: 'center' }}>
        Showing {tableParams.pagination?.current} to {tableParams.pagination?.pageSize} of{' '}
        {tableParams.pagination?.total} entries
      </p>
      <Table
        columns={columns}
        dataSource={experiments}
        rowKey="id"
        pagination={tableParams.pagination}
        loading={loading}
        style={{ overflowX: 'auto' }}
        scroll={{ x: 800 }}
        bordered
        onChange={pagination => {
          fetchData({ ...params, current: pagination.current, pageSize: pagination.pageSize });
          const newParams = {
            ...params,
            current: pagination.current,
            pageSize: pagination.pageSize,
          };
          history.pushState(
            {},
            '',
            `/experiment/list?${new URLSearchParams(newParams).toString()}`
          );
        }}
      />
    </Card>
  );
};

export default ListPersonalExperiment;
