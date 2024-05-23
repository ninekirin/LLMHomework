import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '@/assets/js/config.js';
import { Space, Card, Input, Button, Descriptions, message, Divider } from 'antd';
const { Search } = Input;
import { SaveOutlined, FileAddOutlined, RollbackOutlined, EditOutlined } from '@ant-design/icons';
import Markdown from 'react-markdown';
import gfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkCold } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ExperimentDetail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditingExperiment, setIsEditingExperiment] = useState(false);
  const token = localStorage.getItem('token');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const urlParams = new URL(window.location.href);
  const experiment_id = urlParams?.searchParams?.get('id');

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

  const [user, setUser] = useState({
    id: '',
    username: '',
    email: '',
    user_type: '',
    account_status: '',
    last_online: '',
  });

  const [experiment, setExperiment] = useState({
    id: '',
    experiment_text: '',
    user_id: '',
    question_id: '',
  });

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

  const getUser = id => {
    fetch(`${apiBaseUrl}/user?id=${id}`, {
      method: 'GET',
      headers: {
        Authorization: token,
      },
    })
      .then(response => response.json())
      .then(response => {
        if (response.success) {
          setUser(response.data);
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
        message.error('An error occurred while fetching user information.');
      });
  };

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
        message.error('Error getting question.');
      });
  };

  const getExperiment = id => {
    fetch(`${apiBaseUrl}/experiment?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setExperiment(response.data);
          // get user
          getUser(response.data.user_id);
          // get question
          getQuestion(response.data.question_id);
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
        message.error('Error getting experiment.');
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

  const editExperiment = experiment => {
    fetch(`${apiBaseUrl}/experiment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(experiment),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success('Experiment updated successfully!');
          setExperiment(response.data);
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
        message.error('Error updating experiment.');
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
    if (experiment_id) {
      getExperiment(experiment_id);
    }
  }, [navigate]);

  if (!experiment_id) {
    return (
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card
          title="Experiment Detail"
          headStyle={{ fontSize: '20px' }}
          extra={
            <Button type="primary" onClick={() => navigate(-1)}>
              {isMobile ? null : 'Back'}
              <RollbackOutlined />
            </Button>
          }
        >
          You have not selected any experiment. Please navigate to an experiment by its ID.
          <Divider />
          <Search
            placeholder="Enter Experiment ID"
            allowClear
            enterButton="Go"
            size="large"
            type="number"
            onSearch={value => {
              if (value) {
                getExperiment(value);
                navigate(`/experiment/view?id=${value}`);
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
          title="Experiment Detail"
          headStyle={{ fontSize: '20px' }}
          extra={
            <Button type="primary" onClick={() => navigate(-1)}>
              {isMobile ? null : 'Back'}
              <RollbackOutlined />
            </Button>
          }
        >
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <Card title="Question Text">
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
            </Card>
            <Card
              title="Experiment Information"
              extra={
                <Button
                  type="primary"
                  onClick={() => navigate(`/request/create?experiment_id=${experiment.id}`)}
                >
                  {isMobile ? null : 'Request to add this experiment'}
                  <FileAddOutlined />
                </Button>
              }
            >
              <Descriptions column={1}>
                <Descriptions.Item label="Experiment ID">{experiment.id}</Descriptions.Item>
                <Descriptions.Item label="Created by">{user.username}</Descriptions.Item>
                <Descriptions.Item label="Is Answer">
                  {experiment.is_answer ? 'Yes' : 'No'}
                </Descriptions.Item>
                <Descriptions.Item label="Course Code">{course.course_code}</Descriptions.Item>
                <Descriptions.Item label="Course Name">{course.course_name}</Descriptions.Item>
                <Descriptions.Item label="Course Category">
                  {course.course_category}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title="Experiment Text"
              extra={
                JSON.parse(localStorage.getItem('user')).user_type === 'ADMIN' ||
                JSON.parse(localStorage.getItem('user')).user_type === 'TEACHER' ? (
                  <Button
                    type="primary"
                    onClick={() => {
                      setIsEditingExperiment(!isEditingExperiment);
                      if (isEditingExperiment) {
                        editExperiment(experiment);
                      }
                    }}
                  >
                    {isMobile ? null : isEditingExperiment ? 'Save' : 'Edit'}
                    {isEditingExperiment ? <SaveOutlined /> : <EditOutlined />}
                  </Button>
                ) : null
              }
            >
              {isEditingExperiment ? (
                <Input.TextArea
                  showCount
                  maxLength={65535}
                  style={{ height: '200px' }}
                  value={experiment.experiment_text}
                  onChange={e => setExperiment({ ...experiment, experiment_text: e.target.value })}
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
                  {experiment.experiment_text}
                </Markdown>
              )}
            </Card>
          </Space>
        </Card>
      </Space>
    </>
  );
};

export default ExperimentDetail;
