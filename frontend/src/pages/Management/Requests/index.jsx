import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Typography, Table, Tag, Space, Select, message, Row, Col } from 'antd';
const { Title } = Typography;
import { apiBaseUrl } from '@/assets/js/config';

const { Option } = Select;

const HandleUserRequest = () => {
  const navigate = useNavigate();
  const urlParams = new URL(window.location.href);
  const params = Object.fromEntries(urlParams.searchParams);
  const token = localStorage.getItem('token');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState(params.request_type || '');
  const [filterStatus, setFilterStatus] = useState(params.request_status || '');
  const [filterOrder, setFilterOrder] = useState(params.order || 'true');
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: Number(params.current) || 1,
      pageSize: Number(params.pageSize) || 10,
      total: 0,
    },
  });

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
    }
  }, []);

  useEffect(() => {
    updateUrlAndGetUserRequests();
  }, [filterType, filterStatus, filterOrder]);

  const updateUrlAndGetUserRequests = () => {
    const newParams = {
      ...params,
      current: 1,
      desc_order: filterOrder,
    };

    if (filterType) {
      newParams.request_type = filterType;
    } else {
      delete newParams.request_type;
    }

    if (filterStatus) {
      newParams.request_status = filterStatus;
    } else {
      delete newParams.request_status;
    }

    window.history.pushState(
      {},
      '',
      `/management/requests?${new URLSearchParams(newParams).toString()}`
    );

    getUserRequests({ current: 1, pageSize: tableParams.pagination.pageSize });
  };

  const getUserRequests = params => {
    setLoading(true);
    const query = new URLSearchParams({
      ...params,
      desc_order: filterOrder,
    });

    if (filterType) query.append('request_type', filterType);
    if (filterStatus) query.append('request_status', filterStatus);

    fetch(`${apiBaseUrl}/requests?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setRequests(response.data.requests);
          setTableParams(prev => ({
            ...prev,
            pagination: {
              current: response.data.pagination.current,
              pageSize: response.data.pagination.pageSize,
              total: response.data.pagination.total,
            },
          }));
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
      })
      .finally(() => setLoading(false));
  };

  const handleStatusChange = (requestId, currentStatus, newStatus) => {
    if (currentStatus !== 'PENDING') {
      message.error('Only PENDING requests can be updated.');
      return;
    }
    if (newStatus === 'PENDING') {
      message.error('New status cannot be PENDING.');
      return;
    }
    fetch(`${apiBaseUrl}/request`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ id: requestId, request_status: newStatus }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success('Status updated successfully.');
          getUserRequests({
            current: tableParams.pagination.current,
            pageSize: tableParams.pagination.pageSize,
          });
        } else {
          message.error(response.message);
          getUserRequests({
            current: tableParams.pagination.current,
            pageSize: tableParams.pagination.pageSize,
          });
          // NO_TOKEN, INVALID_TOKEN, EXPIRED_TOKEN: redirect to login
          if (
            response.code === 'NO_TOKEN' ||
            response.code === 'INVALID_TOKEN' ||
            response.code === 'EXPIRED_TOKEN'
          ) {
            navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
          }
        }
      })
      .catch(error => {
        message.error('Error updating status.');
      });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 50,
    },
    {
      title: 'User ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 100,
    },
    {
      title: 'Type',
      dataIndex: 'request_type',
      key: 'request_type',
      width: 150,
      render: type => {
        let color = 'geekblue';
        let txt = type;
        if (type === 'ADD_COURSE') {
          color = 'blue';
          txt = 'Add Course';
        } else if (type === 'UPDATE_SCORE') {
          color = 'purple';
          txt = 'Update Score';
        } else if (type === 'ADD_EXPERIMENT') {
          color = 'green';
          txt = 'Add Experiment';
        }
        return <Tag color={color}>{txt}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'request_status',
      key: 'request_status',
      width: 150,
      render: status => {
        let color = 'geekblue';
        let txt = status;
        if (status === 'PENDING') {
          color = 'blue';
          txt = 'Pending';
        } else if (status === 'APPROVED') {
          color = 'green';
          txt = 'Approved';
        } else if (status === 'REJECTED') {
          color = 'red';
          txt = 'Rejected';
        } else if (status === 'REVOKED') {
          color = 'orange';
          txt = 'Revoked';
        }
        return <Tag color={color}>{txt}</Tag>;
      },
    },
    {
      title: 'Explanation',
      dataIndex: 'request_explanation',
      key: 'request_explanation',
      width: 200,
    },
    {
      title: 'Details',
      key: 'details',
      width: 200,
      render: (_, record) => {
        if (record.request_type === 'UPDATE_SCORE') {
          return (
            <p>
              <b>Answer ID:</b> {record.answer_id}
              <br />
              <b>New Score:</b> {record.new_score}
            </p>
          );
        } else if (record.request_type === 'ADD_COURSE') {
          return (
            <p>
              <b>Course Code:</b> {record.course_code}
              <br />
              <b>Course Name:</b> {record.course_name}
              <br />
              <b>Course Category:</b> {record.course_category}
            </p>
          );
        } else if (record.request_type === 'ADD_EXPERIMENT') {
          return (
            <p>
              <b>LLM Name:</b> {record.llm_name}
              <br />
              <b>Score:</b> {record.score}
              <br />
              <b>Comment:</b> {record.comment}
              <br />
              <Link to={`/experiment/view?id=${record.experiment_id}`}>View Experiment</Link>
            </p>
          );
        }
        return null;
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Select
            defaultValue={record.request_status}
            style={{ width: 120 }}
            onChange={value => handleStatusChange(record.id, record.request_status, value)}
            disabled={record.request_status !== 'PENDING'}
          >
            <Option value="PENDING">Pending</Option>
            <Option value="APPROVED">Approved</Option>
            <Option value="REJECTED">Rejected</Option>
            <Option value="REVOKED">Revoked</Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <Card title="List of User Requests" headStyle={{ fontSize: '20px' }}>
      <Title level={4} style={{ textAlign: 'center' }}>
        User Requests
      </Title>
      <p style={{ textAlign: 'center' }}>
        Showing {tableParams.pagination?.current} to {tableParams.pagination?.pageSize} of{' '}
        {tableParams.pagination?.total} entries
      </p>
      <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by Type"
              style={{ width: '100%' }}
              value={filterType}
              onChange={value => setFilterType(value)}
            >
              <Option value="">All Types</Option>
              <Option value="ADD_COURSE">Add Course</Option>
              <Option value="UPDATE_SCORE">Update Score</Option>
              <Option value="ADD_EXPERIMENT">Add Experiment</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by Status"
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={value => setFilterStatus(value)}
            >
              <Option value="">All Statuses</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="REVOKED">Revoked</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Order"
              style={{ width: '100%' }}
              value={filterOrder}
              onChange={value => setFilterOrder(value)}
            >
              <Option value="true">Descending Order (Newest First)</Option>
              <Option value="false">Ascending Order (Oldest First)</Option>
            </Select>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          pagination={tableParams.pagination}
          loading={loading}
          style={{ overflowX: 'auto' }}
          scroll={{ x: 800 }}
          bordered
          onChange={pagination => {
            getUserRequests({ current: pagination.current, pageSize: pagination.pageSize });
            const newParams = {
              ...params,
              current: pagination.current,
              pageSize: pagination.pageSize,
            };
            window.history.pushState(
              {},
              '',
              `/management/requests?${new URLSearchParams(newParams).toString()}`
            );
          }}
        />
      </Space>
    </Card>
  );
};

export default HandleUserRequest;
