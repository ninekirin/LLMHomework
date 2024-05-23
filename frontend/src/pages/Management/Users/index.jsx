import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Table,
  Space,
  Card,
  Divider,
  Modal,
  Input,
  Select,
  Form,
  Tooltip,
  Tag,
  message,
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  UndoOutlined,
  DeleteOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';
import { apiBaseUrl } from '@/assets/js/config.js';
const { confirm } = Modal;

const EditableCell = ({ editing, dataIndex, title, inputType, record, children, ...restProps }) => {
  const getInput = () => {
    if (dataIndex === 'user_type') {
      return (
        <Select
          options={[
            { label: 'Admin', value: 'ADMIN' },
            { label: 'Teacher', value: 'TEACHER' },
            { label: 'Student', value: 'STUDENT' },
          ]}
        />
      );
    }
    if (dataIndex === 'account_status') {
      return (
        <Select
          options={[
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Inactive', value: 'INACTIVE' },
          ]}
        />
      );
    }
    return <Input />;
  };

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `Please Input ${title}!` }]}
        >
          {getInput()}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const UserAccount = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const isEditing = record => record.id === editingKey;

  const edit = record => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.id);
  };

  const cancel = () => setEditingKey('');

  const save = id => {
    form
      .validateFields()
      .then(row => {
        const newData = [...users];
        const index = newData.findIndex(item => id === item.id);

        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, { ...item, ...row });
          setUsers(newData);
          setEditingKey('');

          fetch(`${apiBaseUrl}/user`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ id, ...row }),
          })
            .then(res => res.json())
            .then(response => {
              if (response.success) {
                message.success(response.message);
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
              message.error('Error saving user.');
            });
        }
      })
      .catch(error => {
        message.error('Error saving user.' + error);
      });
  };

  const showDeleteConfirm = id => {
    confirm({
      title: 'Are you sure you want to delete this user?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteUser(id);
      },
    });
  };

  const deleteUser = id => {
    fetch(`${apiBaseUrl}/user`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify({ id }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success(response.message);
          getUsers({ pagination });
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
        message.error('Error deleting user.');
      });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Username', dataIndex: 'username', editable: true, width: 100 },
    { title: 'Email', dataIndex: 'email', editable: true, width: 200 },
    {
      title: 'User Type',
      dataIndex: 'user_type',
      editable: true,
      width: 100,
      render: type => {
        if (type === 'ADMIN') {
          return (
            <Tag icon={<SecurityScanOutlined />} color="red">
              Admin
            </Tag>
          );
        } else if (type === 'TEACHER') {
          return (
            <Tag icon={<SecurityScanOutlined />} color="blue">
              Teacher
            </Tag>
          );
        } else if (type === 'STUDENT') {
          return (
            <Tag icon={<SecurityScanOutlined />} color="green">
              Student
            </Tag>
          );
        }
      },
    },
    {
      title: 'Account Status',
      dataIndex: 'account_status',
      editable: true,
      width: 100,
      render: status => {
        if (status === 'ACTIVE') {
          return <Tag color="green">Active</Tag>;
        } else if (status === 'INACTIVE') {
          return <Tag color="volcano">Inactive</Tag>;
        }
      },
    },
    { title: 'Last Online', dataIndex: 'last_online', width: 150 },
    {
      title: 'Operation',
      dataIndex: 'operation',
      width: 100,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Tooltip title="Save">
              <Button type="primary" onClick={() => save(record.id)} icon={<SaveOutlined />} />
            </Tooltip>
            <Tooltip title="Cancel" onClick={cancel}>
              <Button icon={<UndoOutlined />} />
            </Tooltip>
          </Space>
        ) : (
          <Space>
            <Tooltip title="Edit">
              <Button
                type="default"
                onClick={() => edit(record)}
                icon={<EditOutlined />}
                disabled={editingKey !== ''}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                onClick={() => showDeleteConfirm(record.id)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const mergedColumns = columns.map(col => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: record => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const getUsers = params => {
    setLoading(true);
    const query = new URLSearchParams({
      current: params.pagination.current,
      pageSize: params.pagination.pageSize,
    }).toString();

    fetch(`${apiBaseUrl}/users?${query}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setUsers(response.data.users);
          setPagination({
            ...params.pagination,
            total: response.data.total,
          });
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
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
    } else {
      getUsers({ pagination });
    }
  }, []);

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card title="User Account Management" size="default" headStyle={{ fontSize: '20px' }}>
        <Form form={form} component={false}>
          <Table
            components={{ body: { cell: EditableCell } }}
            bordered
            dataSource={users}
            columns={mergedColumns}
            rowKey="id"
            pagination={{
              ...pagination,
              onChange: (page, pageSize) => {
                setPagination(prev => ({
                  ...prev,
                  current: page,
                  pageSize,
                }));
                getUsers({ pagination: { current: page, pageSize } });
              },
            }}
            loading={loading}
            scroll={{ x: 800 }}
            style={{ overflowX: 'auto' }}
          />
        </Form>
      </Card>
    </Space>
  );
};

export default UserAccount;
