import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '@/assets/js/config.js';
import { Space, Col, Row, Card, Input, Button, Form, message, Divider } from 'antd';
import Markdown from 'react-markdown';
import gfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkCold } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CreateExperiment = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
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
  const initialQuestionId = urlParams?.searchParams?.get('question_id') || '';
  const [questionId, setQuestionId] = useState(initialQuestionId);
  const [question, setQuestion] = useState({
    id: '',
    question_text: '',
    question_score: '',
    course_code: '',
    course_name: '',
    course_category: '',
  });

  const [experimentText, setExperimentText] = useState('');

  const getQuestion = id => {
    if (!id) return;
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

  const onFinish = values => {
    const { question_id, experiment_text } = values;
    const data = {
      question_id,
      experiment_text,
    };

    fetch(`${apiBaseUrl}/experiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success('Personal experiment created successfully!');
          navigate('/experiment/list');
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
        message.error('Error creating personal experiment.');
      });
  };

  const onChangeQuestionID = e => {
    const value = e.target.value;
    const regEx = /^[0-9]*$/;
    if (regEx.test(value)) {
      setQuestionId(value);
      if (value.length > 0) {
        // Fetch the question after a delay if input is valid
        clearTimeout(window.questionFetchTimeout);
        window.questionFetchTimeout = setTimeout(() => getQuestion(value), 500);
      }
    } else {
      message.error('Please input a valid question ID!');
    }
  };

  // Redirect to login if not logged in
  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
    }
    if (initialQuestionId) {
      getQuestion(initialQuestionId);
    }
  }, []);

  return (
    <Card title="Create Personal Experiment" headStyle={{ fontSize: '20px' }}>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Form
          form={form}
          name="create_personal_experiment"
          onFinish={onFinish}
          initialValues={{ question_id: initialQuestionId }}
          layout="vertical"
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                name="question_id"
                label="Question ID"
                rules={[{ required: true, message: 'Please input question ID!' }]}
              >
                <Input
                  onChange={onChangeQuestionID}
                  disabled={initialQuestionId}
                  placeholder="Question ID"
                  type="number"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              {questionId && question.question_text && (
                <Card title="Question Preview" bordered={false}>
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
              )}
            </Col>
            <Col span={24}>
              <Form.Item
                name="experiment_text"
                label="Experiment Text (Markdown supported)"
                rules={[{ required: true, message: 'Please input experiment text!' }]}
              >
                <Input.TextArea
                  showCount
                  maxLength={65535}
                  style={{ height: '200px' }}
                  onChange={e => setExperimentText(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              {experimentText && (
                <>
                  <Card title="Experiment Text Preview" bordered={false}>
                    <Markdown
                      remarkPlugins={[gfm]}
                      components={{
                        img(props) {
                          return <img {...props} style={{ maxWidth: '100%' }} />;
                        },
                        code: code,
                      }}
                    >
                      {experimentText}
                    </Markdown>
                  </Card>
                  <Divider />
                </>
              )}
            </Col>
            <Col span={24}>
              <Form.Item style={{ textAlign: 'right' }}>
                <Button type="primary" htmlType="submit">
                  Save Personal Experiment
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Space>
    </Card>
  );
};

export default CreateExperiment;
