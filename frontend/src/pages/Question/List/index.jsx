import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Space, Card, Typography, Tooltip, message, Button, Modal } from 'antd';
import { FileAddOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiBaseUrl } from '@/assets/js/config.js';

const { Title } = Typography;
const { confirm } = Modal;

const ListQuestion = () => {
  const navigate = useNavigate();
  const urlParams = new URL(window.location.href);
  // convert URLSearchParams to object
  const params = Object.fromEntries(urlParams.searchParams);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const token = localStorage.getItem('token');

  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);

  const [mixinQuestions, setMixinQuestions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });

  const [courseCategories, setCourseCategories] = useState([
    { category: 'PROG', name: 'Programming' },
    { category: 'MATH', name: 'Mathematics' },
    { category: 'WRITING', name: 'Writing' },
  ]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Question',
      children: [
        {
          title: 'Text',
          dataIndex: 'question_text',
          width: 200,
          render: text => (text.length > 50 ? `${text.substring(0, 50)}...` : text),
        },
        {
          title: 'Category',
          dataIndex: 'question_category',
          width: 100,
          render: category => {
            const found = courseCategories.find(cat => cat.category === category);
            return found ? found.name : category;
          },
        },
        {
          title: 'Score',
          width: 80,
          dataIndex: 'question_score',
        },
      ],
    },
    {
      title: 'Course',
      children: [
        {
          title: 'Code',
          width: 100,
          dataIndex: 'course_code',
        },
        {
          title: 'Name',
          width: 150,
          dataIndex: 'course_name',
        },
        {
          title: 'Category',
          width: 100,
          dataIndex: 'course_category',
        },
      ],
    },
    {
      title: 'Action',
      key: 'operation',
      width: 150,
      render: (text, question) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/question/view?id=${question.id}`)}
            />
          </Tooltip>
          {JSON.parse(localStorage.getItem('user')).user_type === 'ADMIN' && (
            <>
              <Tooltip title="Edit">
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/question/create-or-edit?id=${question.id}`)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  type="danger"
                  icon={<DeleteOutlined />}
                  onClick={() => showDeleteConfirm(question.id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const getQuestions = params => {
    setLoading(true);
    const query = Object.entries(params)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    fetch(`${apiBaseUrl}/questions?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setQuestions(response.data.questions);
          getCourses(response.data.questions);
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
            navigate('/login', {
              state: { navBackMsg: 'Login expired. Please login again.' },
            });
          }
        }
      });
  };

  const getCourses = questions => {
    // get courses in questions.course_id
    const courseIds = questions.map(question => question.course_id);
    const uniqueCourseIds = [...new Set(courseIds)];
    // use ',' to join courseIds
    const query = uniqueCourseIds.join(',');

    fetch(`${apiBaseUrl}/courses?ids=${query}`, {
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
          // mixin questions with courses
          const mixinQuestions = questions.map(question => {
            const course = response.data.courses.find(course => course.id === question.course_id);
            return {
              ...question,
              course_code: course?.course_code,
              course_name: course?.course_name,
              course_category: course?.course_category,
            };
          });
          setMixinQuestions(mixinQuestions);
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
        message.error('Error fetching courses.');
      });
  };

  const deleteQuestion = id => {
    fetch(`${apiBaseUrl}/question`, {
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
          message.success('Question deleted successfully!');
          getQuestions({ current: 1, pageSize: 10 }); // Refresh the list
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
        message.error('Error deleting question.');
      });
  };

  const showDeleteConfirm = id => {
    confirm({
      title: 'Are you sure you want to delete this question?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteQuestion(id);
      },
    });
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
    } else {
      if (!urlParams?.searchParams) {
        getQuestions({ current: 1, pageSize: 10 }); // Initial fetch
      } else {
        getQuestions(params);
      }
    }
  }, [navigate]);

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card
        title="List of Questions"
        headStyle={{ fontSize: '20px' }}
        extra={
          JSON.parse(localStorage.getItem('user')).user_type === 'ADMIN' && (
            <Button type="primary" onClick={() => navigate('/question/create-or-edit')}>
              <FileAddOutlined />
              {isMobile ? '' : 'Create a New Question'}
            </Button>
          )
        }
      >
        <Title level={4} style={{ textAlign: 'center' }}>
          Questions
        </Title>
        <p style={{ textAlign: 'center' }}>
          Showing {tableParams.pagination?.current} to {tableParams.pagination?.pageSize} of{' '}
          {tableParams.pagination?.total} entries
        </p>
        <Table
          columns={columns}
          dataSource={mixinQuestions}
          rowKey="id"
          pagination={tableParams.pagination}
          loading={loading}
          style={{ overflowX: 'auto' }}
          scroll={{ x: 800 }}
          bordered
          onChange={pagination => {
            getQuestions({ ...params, current: pagination.current, pageSize: pagination.pageSize });
            const newParams = {
              ...params,
              current: pagination.current,
              pageSize: pagination.pageSize,
            };
            history.pushState(
              {},
              '',
              `/question/list?${new URLSearchParams(newParams).toString()}`
            );
          }}
        />
      </Card>
    </Space>
  );
};

export default ListQuestion;
