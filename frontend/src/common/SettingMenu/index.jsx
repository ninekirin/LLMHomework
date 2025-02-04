import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tooltip, Switch, Drawer } from 'antd';
import { SettingOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import cls from 'classnames';
import styles from './index.less';
const SettingMenu = () => {
  const [settingVisible, setSettingVisible] = useState(true);
  const dispatch = useDispatch();
  const { theme, menuMode } = useSelector(state => state.SettingModel);
  useEffect(() => {
    setSettingVisible(false);
  }, []);
  return (
    <>
      <div
        className={cls(styles.setting, { [styles.close]: !settingVisible })}
        onClick={() => setSettingVisible(val => !val)}
      >
        {settingVisible ? <CloseOutlined /> : <SettingOutlined />}
      </div>
      <Drawer
        closable={false}
        open={settingVisible}
        onClose={() => setSettingVisible(false)}
        width={300}
        className={styles.container}
      >
        <div className={cls(styles.item, styles.vertical)}>
          <p>Style</p>
          <div style={{ display: 'flex' }}>
            {
              <Tooltip title="Dark">
                <div
                  className={styles.dark}
                  onClick={() => {
                    dispatch({ type: 'setTheme', data: 'dark' });
                  }}
                >
                  {theme === 'dark' && <CheckOutlined />}
                </div>
              </Tooltip>
            }
            <Tooltip title="Light">
              <div
                className={styles.light}
                onClick={() => dispatch({ type: 'setTheme', data: 'light' })}
              >
                {theme === 'light' && <CheckOutlined />}
              </div>
            </Tooltip>
          </div>
        </div>
        <div className={cls(styles.item, styles.vertical)}>
          <p>Layout</p>
          <div style={{ display: 'flex' }}>
            <Tooltip title="Horizontal">
              <div
                className={styles.inline}
                onClick={() => dispatch({ type: 'setMenuMode', data: 'inline' })}
              >
                {menuMode === 'inline' && <CheckOutlined />}
              </div>
            </Tooltip>

            <Tooltip title="Vertical">
              <div
                className={styles.horizontal}
                onClick={() => dispatch({ type: 'setMenuMode', data: 'horizontal' })}
              >
                {menuMode === 'horizontal' && <CheckOutlined />}
              </div>
            </Tooltip>

            <Tooltip title="Mixin">
              <div
                className={styles.mixin}
                onClick={() => {
                  dispatch({ type: 'setMenuMode', data: 'mixin' });
                }}
              >
                {menuMode === 'mixin' && <CheckOutlined />}
              </div>
            </Tooltip>
          </div>
        </div>
        {/* <div className={cls(styles.flex, styles.horizontal)}>
        <div>Pin Menu</div>
        <Switch defaultChecked onChange={v => dispatch({ type: "setFixHeader", data: v })} />
      </div> */}
        <div className={cls(styles.item, styles.flex)} />
      </Drawer>
    </>
  );
};
export default SettingMenu;
