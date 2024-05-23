import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '@/assets/js/config.js';
import { Space, Card, Table, Tooltip, Input, Button, Descriptions, message, Divider } from 'antd';
const { Search } = Input;
import { SaveOutlined, RollbackOutlined, EditOutlined } from '@ant-design/icons';
import Markdown from 'react-markdown';
import gfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkCold } from 'react-syntax-highlighter/dist/esm/styles/prism';

const QuestionDetail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const token = localStorage.getItem('token');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const code = ({ node, inline, className, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter style={coldarkCold} language={match[1]} PreTag="div" {...props}>
        {props.children}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {props.children}
      </code>
    );
  };

  const urlParams = new URL(window.location.href);
  const question_id = urlParams?.searchParams?.get('id');

  const [question, setQuestion] = useState({
    id: '',
    question_text: '',
    question_score: '',
    question_category: '',
    course_id: '',
  });
  const [course, setCourse] = useState({
    id: '',
    course_code: '',
    course_name: '',
    course_category: '',
  });
  const [answers, setAnswers] = useState([]);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });

  const answerColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'LLM Name',
      dataIndex: 'llm_name',
      key: 'llm_name',
    },
    {
      title: 'Answer Text',
      dataIndex: 'answer_text',
      key: 'answer_text',
      render: text => (
        <Markdown
          remarkPlugins={[gfm]}
          components={{
            img(props) {
              return <img {...props} style={{ maxWidth: '100%' }} />;
            },
            code: code,
          }}
        >
          {text}
        </Markdown>
      ),
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      render: text => (
        <Markdown
          remarkPlugins={[gfm]}
          components={{
            img(props) {
              return <img {...props} style={{ maxWidth: '100%' }} />;
            },
            code: code,
          }}
        >
          {text}
        </Markdown>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (text, record) => `${record.score}/${question.question_score}`,
    },
    {
      title: 'Score Update Count',
      dataIndex: 'score_update_count',
      key: 'score_update_count',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Tooltip title="Request to Update Score">
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => navigate(`/request/create?answer_id=${record.id}`)}
          />
        </Tooltip>
      ),
    },
  ];

  const getQuestion = id => {
    fetch(`${apiBaseUrl}/question?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setQuestion(response.data);
          getCourse(response.data.course_id);
          getAnswers({ current: 1, pageSize: 10, question_id: id });
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
        message.error('Error getting question.');
      });
  };

  const getCourse = id => {
    fetch(`${apiBaseUrl}/course?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setCourse(response.data);
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
        message.error('Error getting course.');
      });
  };

  const editQuestion = question => {
    fetch(`${apiBaseUrl}/question`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(question),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success('Question updated successfully!');
          setQuestion(response.data);
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
        message.error('Error updating question.');
      });
  };

  const getAnswers = params => {
    setLoading(true);
    const query = Object.entries(params)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    fetch(`${apiBaseUrl}/answers?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setAnswers(response.data.answers);
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
    }
    if (question_id) {
      getQuestion(question_id);
    }
  }, [navigate]);

  if (!question_id) {
    return (
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card
          title="Question Detail"
          headStyle={{ fontSize: '20px' }}
          extra={
            <Button type="primary" onClick={() => navigate(-1)}>
              {isMobile ? null : 'Back'}
              <RollbackOutlined />
            </Button>
          }
        >
          You have not selected any question. Please navigate to a question by its ID.
          <Divider />
          <Search
            placeholder="Enter Question ID"
            allowClear
            enterButton="Go"
            size="large"
            type="number"
            onSearch={value => {
              if (value) {
                getQuestion(value);
                navigate(`/question/view?id=${value}`);
              }
            }}
          />
        </Card>
      </Space>
    );
  }

  return (
    <>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card
          title="Question Detail"
          headStyle={{ fontSize: '20px' }}
          extra={
            <Button type="primary" onClick={() => navigate(-1)}>
              {isMobile ? null : 'Back'}
              <RollbackOutlined />
            </Button>
          }
        >
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <Card title="Question Information">
              <Descriptions column={1}>
                <Descriptions.Item label="Question ID">{question.id}</Descriptions.Item>
                <Descriptions.Item label="Question Score">
                  {question.question_score}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Course Information">
              <Descriptions column={1}>
                <Descriptions.Item label="Course Code">{course.course_code}</Descriptions.Item>
                <Descriptions.Item label="Course Name">{course.course_name}</Descriptions.Item>
                <Descriptions.Item label="Course Category">
                  {course.course_category}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title="Question Text"
              extra={
                // if the user.user_type is not ADMIN, this route will not be shown
                JSON.parse(localStorage.getItem('user')).user_type == 'ADMIN' ? (
                  <Button
                    type="primary"
                    onClick={() => {
                      setIsEditingQuestion(!isEditingQuestion);
                      if (isEditingQuestion) {
                        editQuestion(question);
                      }
                    }}
                  >
                    {isMobile ? null : isEditingQuestion ? 'Save' : 'Edit'}
                    {isEditingQuestion ? <SaveOutlined /> : <EditOutlined />}
                  </Button>
                ) : null
              }
            >
              {isEditingQuestion ? (
                <Input.TextArea
                  showCount
                  maxLength={65535}
                  style={{ height: '200px' }}
                  value={question.question_text}
                  onChange={e => setQuestion({ ...question, question_text: e.target.value })}
                />
              ) : (
                <Markdown
                  remarkPlugins={[gfm]}
                  components={{
                    img(props) {
                      return <img {...props} style={{ maxWidth: '100%' }} />;
                    },
                    code: code,
                  }}
                >
                  {question.question_text}
                </Markdown>
              )}
            </Card>
          </Space>
        </Card>

        <Card
          title="Answers to this question"
          headStyle={{ fontSize: '20px' }}
          extra={
            <Button
              type="primary"
              onClick={() => navigate(`/experiment/create?question_id=${question_id}`)}
            >
              {isMobile ? null : 'Create Personal Experiment'}
              <EditOutlined />
            </Button>
          }
        >
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <p style={{ textAlign: 'left' }}>
              Showing {tableParams.pagination?.current} to {tableParams.pagination?.pageSize} of{' '}
              {tableParams.pagination?.total} entries
            </p>
            <Table
              columns={answerColumns}
              dataSource={answers}
              rowKey="id"
              pagination={tableParams.pagination}
              loading={loading}
              onChange={pagination => getAnswers({ ...pagination, searchText })}
              fixedHeader={true}
              style={{ overflowX: 'auto' }}
              scroll={{ x: 800 }}
              bordered
            />
          </Space>
        </Card>
      </Space>
    </>
  );
};

export default QuestionDetail;
