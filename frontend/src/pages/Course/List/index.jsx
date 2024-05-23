import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Table, Space, Card, Typography, Button, message, Modal } from 'antd';
import { FileAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiBaseUrl } from '@/assets/js/config.js';

const { Title } = Typography;
const { confirm } = Modal;

const ListCourses = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [courses, setCourses] = useState([]);
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
      width: 50,
    },
    {
      title: 'Course Code',
      dataIndex: 'course_code',
      width: 80,
    },
    {
      title: 'Course Name',
      dataIndex: 'course_name',
      width: 200,
    },
    {
      title: 'Course Category',
      dataIndex: 'course_category',
      width: 80,
    },
    {
      title: 'Action',
      key: 'operation',
      width: 100,
      // if the user.user_type is not ADMIN, the Edit and Delete buttons will be hidden
      render: (text, course) => (
        <Space>
          <Tooltip title="Add Question">
            <Button
              type="default"
              icon={<FileAddOutlined />}
              onClick={() => navigate(`/question/create-or-edit?course_code=${course.course_code}`)}
            />
          </Tooltip>
          {JSON.parse(localStorage.getItem('user')).user_type === 'ADMIN' && (
            <>
              <Tooltip title="Edit">
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/course/create-or-edit?id=${course.id}`)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  type="danger"
                  icon={<DeleteOutlined />}
                  onClick={() => showDeleteConfirm(course.id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const getCourses = params => {
    setLoading(true);
    const query = Object.entries(params)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    fetch(`${apiBaseUrl}/courses?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setCourses(response.data.courses);
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

  const deleteCourse = id => {
    fetch(`${apiBaseUrl}/course`, {
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
          message.success('Course deleted successfully!');
          getCourses({ current: 1, pageSize: 10 }); // Refresh the list
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
        message.error('Error deleting course.');
      });
  };

  const showDeleteConfirm = id => {
    confirm({
      title: 'Are you sure you want to delete this course?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteCourse(id);
      },
    });
  };

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
    } else {
      getCourses({ current: 1, pageSize: 10 }); // Initial fetch
    }
  }, []);

  return (
    <Card title="List of Courses" headStyle={{ fontSize: '20px' }}>
      <Title level={4} style={{ textAlign: 'center' }}>
        Courses
      </Title>
      <p style={{ textAlign: 'center' }}>
        Showing {tableParams.pagination?.current} to {tableParams.pagination?.pageSize} of{' '}
        {tableParams.pagination?.total} entries
      </p>
      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        pagination={tableParams.pagination}
        loading={loading}
        bordered
        scroll={{ x: 800 }}
        style={{ overflowX: 'auto' }}
        onChange={pagination => {
          getCourses({ current: pagination.current, pageSize: pagination.pageSize });
        }}
      />
    </Card>
  );
};

export default ListCourses;
