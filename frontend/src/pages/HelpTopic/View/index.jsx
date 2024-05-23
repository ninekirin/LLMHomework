import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '@/assets/js/config.js';
import { Space, Card, Descriptions, Input, Button, message, Divider, Modal } from 'antd';
const { Search } = Input;
const { confirm } = Modal;
import { SaveOutlined, RollbackOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Markdown from 'react-markdown';
import gfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkCold } from 'react-syntax-highlighter/dist/esm/styles/prism';

const HelpTopicDetail = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
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
  const helptopic_id = urlParams?.searchParams?.get('id');

  const [helpTopic, setHelpTopic] = useState({
    id: '',
    topic_title: '',
    topic_content: '',
    topic_type: '',
    course_id: '',
    llm_name: '',
    llm_answer: '',
    human_score: '',
  });

  const getHelpTopic = id => {
    fetch(`${apiBaseUrl}/helptopic?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setHelpTopic(response.data);
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
        message.error('Error fetching help topic.');
        setLoading(false);
      });
  };

  const editHelpTopic = helpTopic => {
    fetch(`${apiBaseUrl}/helptopic`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({
        id: helpTopic.id,
        // topic_title: helpTopic.topic_title,
        topic_content: helpTopic.topic_content,
        // topic_type: helpTopic.topic_type,
        // course_id: helpTopic.course_id,
        // llm_name: helpTopic.llm_name,
        // llm_answer: helpTopic.llm_answer,
        // human_score: helpTopic.human_score,
      }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success('Help topic updated successfully!');
          setHelpTopic(response.data);
          setIsEditing(false);
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
        message.error('Error updating help topic.');
      });
  };

  const showDeleteConfirm = id => {
    confirm({
      title: 'Are you sure you want to delete this help topic?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        handleDelete();
      },
    });
  };

  const handleDelete = () => {
    fetch(`${apiBaseUrl}/helptopic`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ id: helpTopic.id }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success('Help topic deleted successfully!');
          navigate('/helptopic/list');
        } else {
          message.error(response.message);
        }
      })
      .catch(error => {
        message.error('Error deleting help topic.');
      });
  };

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
    } else {
      if (helptopic_id) {
        getHelpTopic(helptopic_id);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!helptopic_id) {
    return (
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card
          title="Help Topic Detail"
          headStyle={{ fontSize: '20px' }}
          extra={
            <Button type="primary" onClick={() => navigate(-1)}>
              {isMobile ? null : 'Back'}
              <RollbackOutlined />
            </Button>
          }
        >
          You have not selected any help topic. Please navigate to a help topic by its ID.
          <Divider />
          <Search
            placeholder="Enter Help Topic ID"
            allowClear
            enterButton="Go"
            size="large"
            type="number"
            onSearch={value => {
              if (value) {
                getHelpTopic(value);
                navigate(`/helptopic/view?id=${value}`);
              }
            }}
          />
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card
        title="Help Topic Detail"
        headStyle={{ fontSize: '20px' }}
        extra={
          <Button type="primary" onClick={() => navigate(-1)}>
            {isMobile ? null : 'Back'}
            <RollbackOutlined />
          </Button>
        }
      >
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Card
            title="Topic Information"
            extra={
              <>
                {JSON.parse(localStorage.getItem('user')).user_type === 'ADMIN' ? (
                  <Button danger onClick={showDeleteConfirm}>
                    {isMobile ? null : 'Delete'}
                    <DeleteOutlined />
                  </Button>
                ) : null}
              </>
            }
          >
            <Descriptions column={1}>
              <Descriptions.Item label="Topic Title">{helpTopic.topic_title}</Descriptions.Item>
              <Descriptions.Item label="Topic Type">{helpTopic.topic_type}</Descriptions.Item>
              <Descriptions.Item label="LLM Name">{helpTopic.llm_name}</Descriptions.Item>
              <Descriptions.Item label="Human Score">{helpTopic.human_score}</Descriptions.Item>
            </Descriptions>
          </Card>
          <Card
            title="Topic Content"
            extra={
              JSON.parse(localStorage.getItem('user')).user_type === 'ADMIN' && (
                <Button
                  type="primary"
                  onClick={() => {
                    if (isEditing) {
                      editHelpTopic(helpTopic);
                    }
                    setIsEditing(!isEditing);
                  }}
                >
                  {isMobile ? null : isEditing ? 'Save' : 'Edit'}
                  {isEditing ? <SaveOutlined /> : <EditOutlined />}
                </Button>
              )
            }
          >
            {isEditing ? (
              <Input.TextArea
                showCount
                maxLength={65535}
                style={{ height: '200px' }}
                value={helpTopic.topic_content}
                onChange={e => setHelpTopic({ ...helpTopic, topic_content: e.target.value })}
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
                {helpTopic.topic_content}
              </Markdown>
            )}
          </Card>
          <Card title="LLM Answer">
            <Markdown
              remarkPlugins={[gfm]}
              components={{
                img(props) {
                  return <img {...props} style={{ maxWidth: '100%' }} />;
                },
                code: code,
              }}
            >
              {helpTopic.llm_answer}
            </Markdown>
          </Card>
        </Space>
      </Card>
    </Space>
  );
};

export default HelpTopicDetail;
