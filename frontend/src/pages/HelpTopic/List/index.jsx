import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Table, Space, Card, Typography, Button, Input, message, Modal } from 'antd';
import { EyeOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { apiBaseUrl } from '@/assets/js/config.js';

const { Title } = Typography;
const { Search } = Input;
const { confirm } = Modal;

const HelpTopicList = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
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
      title: 'Title',
      dataIndex: 'topic_title',
      // sorter: true,
      width: 150,
      render: text => (text.length > 100 ? `${text.substring(0, 100)}...` : text),
    },
    {
      title: 'Content',
      dataIndex: 'topic_content',
      // sorter: true,
      width: 250,
      render: text => (text.length > 100 ? `${text.substring(0, 100)}...` : text),
    },
    {
      title: 'Type',
      dataIndex: 'topic_type',
      width: 100,
    },
    {
      title: 'LLM Name',
      dataIndex: 'llm_name',
      width: 100,
    },
    {
      title: 'LLM Answer',
      dataIndex: 'llm_answer',
      width: 250,
      render: text => (text.length > 100 ? `${text.substring(0, 100)}...` : text),
    },
    {
      title: 'Human Score',
      dataIndex: 'human_score',
      width: 80,
    },
    {
      title: 'Action',
      key: 'operation',
      width: 100,
      render: (text, topic) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/helptopic/view?id=${topic.id}`)}
            />
          </Tooltip>
          {JSON.parse(localStorage.getItem('user')).user_type === 'ADMIN' ? (
            <Tooltip title="Delete">
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                onClick={() => showDeleteConfirm(topic.id)}
              />
            </Tooltip>
          ) : null}
          {/* <Tooltip title="Request Submission">
            <Button
              type="default"
              icon={<UploadOutlined />}
              onClick={() => navigate(`/request/create?topic_id=${topic.id}`)}
            />
          </Tooltip> */}
        </Space>
      ),
    },
  ];

  const getHelpTopics = params => {
    setLoading(true);
    const query = new URLSearchParams({
      keyword: searchKeyword,
      current: params.pagination.current,
      pageSize: params.pagination.pageSize,
    }).toString();

    fetch(`${apiBaseUrl}/helptopics?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setTopics(response.data.topics);
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
        message.error('Error fetching help topics.');
        setLoading(false);
      });
  };

  const deleteTopic = id => {
    fetch(`${apiBaseUrl}/helptopic`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ id: id }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success('Topic deleted successfully!');
          getHelpTopics({ pagination: tableParams.pagination }); // Refresh the list
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
      .catch(error => {
        message.error('Error deleting topic.');
      });
  };

  const showDeleteConfirm = id => {
    confirm({
      title: 'Are you sure you want to delete this topic?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteTopic(id);
      },
    });
  };

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
    } else {
      getHelpTopics({ pagination: tableParams.pagination });
    }
  }, [navigate, searchKeyword]);

  const handleTableChange = (pagination, filters, sorter) => {
    getHelpTopics({
      // sortField: sorter.field,
      // sortOrder: sorter.order,
      pagination,
      ...filters,
    });
  };

  const onSearch = value => {
    setSearchKeyword(value);
  };

  return (
    <Card title="List of Help Topics" headStyle={{ fontSize: '20px' }}>
      <Title level={4} style={{ textAlign: 'center' }}>
        Help Topics
      </Title>
      <p style={{ textAlign: 'center' }}>
        Showing {tableParams.pagination?.current} to {tableParams.pagination?.pageSize} of{' '}
        {tableParams.pagination?.total} entries
      </p>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Search
          placeholder="Search by title"
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={onSearch}
        />
        <Table
          columns={columns}
          dataSource={topics}
          rowKey="id"
          pagination={tableParams.pagination}
          loading={loading}
          onChange={handleTableChange}
          style={{ overflowX: 'auto' }}
          scroll={{ x: 800 }}
          bordered
        />
      </Space>
    </Card>
  );
};

export default HelpTopicList;
