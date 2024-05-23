import React from 'react';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DownOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Dropdown, Space, Layout as Container, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import MenuList from '@/common/MenuList';
import MixinMenuHeader from '@/common/MixinMenuHeader';
import styles from './index.less';
import logo from '@/assets/images/logo512.png';
import { siteName } from '@/assets/js/config.js';
import cls from 'classnames';
import { useNavigate } from 'react-router-dom';
import BreadcrumbGroup from '@/common/BreadcrumbGroup';
const { Header } = Container;
import { apiBaseUrl } from '@/assets/js/config.js';

const NavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sideBarCollapsed, theme, menuMode } = useSelector(state => state.SettingModel);

  const onClick = ({ key }) => {
    if (key === 'logout') {
      fetch(`${apiBaseUrl}/user/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'),
        },
      })
        .then(res => res.json())
        .then(response => {
          if (response.success) {
            message.success(response.message);
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('user');
            window.localStorage.clear();
            navigate('/login');
          } else {
            // message.error(response.message);
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('user');
            window.localStorage.clear();
            navigate('/login');
          }
        });
    }
  };

  const items = [
    {
      key: 'logout',
      label: (
        <Space>
          <LogoutOutlined />
          Logout
        </Space>
      ),
      onClick,
    },
  ];

  return (
    <Header
      className={cls(styles.navBar, {
        [styles[theme]]: menuMode !== 'inline',
      })}
    >
      <div className={styles.navHeader}>
        {menuMode !== 'inline' ? (
          <div className={styles.left}>
            <div className={styles.logo} onClick={() => navigate('/')}>
              <img src={logo} alt="logo" />
              <span
                className={cls({
                  [styles[theme]]: menuMode !== 'inline',
                })}
              >
                {siteName}
              </span>
            </div>
            <div className={styles.menu}>
              {menuMode === 'horizontal' ? <MenuList /> : <MixinMenuHeader />}
            </div>
          </div>
        ) : (
          <div className={styles.inlineLeft}>
            {React.createElement(sideBarCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => dispatch({ type: 'setSideBarCollapsed' }),
            })}
            <BreadcrumbGroup />
          </div>
        )}
        <div
          className={cls(styles.right, {
            [styles[theme]]: menuMode !== 'inline',
            [styles.light]: menuMode === 'inline',
          })}
        >
          <Dropdown menu={{ items }}>
            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
              <Space>
                <UserOutlined />
                {localStorage.getItem('user')
                  ? JSON.parse(localStorage.getItem('user')).username
                  : 'Null'}
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        </div>
      </div>
    </Header>
  );
};

export default NavBar;
