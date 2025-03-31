import React, { useState, useRef } from 'react';
import { User, Mail, Lock, Calendar, Edit, Settings, LogOut, Heart, History } from 'lucide-react';
import './UserProfile.css';

interface UserData {
  name: string;
  email: string;
  joinDate: string;
  avatar: string | ArrayBuffer | null;
  bio: string;
}

const UserProfile: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserData>({
    name: '章建宇',
    email: 'jianyu@tcm.com',
    joinDate: '2022-02-22',
    avatar: null,
    bio: '中医爱好者，专注于传统医学与现代健康的结合研究'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    bio: user.bio
  });

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setUser(prev => ({ ...prev, ...editForm }));
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const menuItems = [
    { icon: <User size={20} />, label: '个人信息', active: true },
    { icon: <History size={20} />, label: '历史记录' },
    { icon: <Settings size={20} />, label: '账号设置' },
    { icon: <Heart size={20} />, label: '问题反馈' },
    { icon: <LogOut size={20} />, label: '退出登录' }
  ];

  return (
    <div className="user-profile-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div className="profile-sidebar">
        <div className="sidebar-header">
          <h2>个人中心</h2>
        </div>
        <nav className="sidebar-menu">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`menu-item ${item.active ? 'active' : ''}`}
            >
              <span className="menu-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="profile-main">
        <div className="profile-header">
          <h1>个人信息</h1>
          {!isEditing ? (
            <button
              className="edit-button"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={16} /> 编辑资料
            </button>
          ) : (
            <div className="edit-actions">
              <button
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                取消
              </button>
              <button
                className="save-button"
                onClick={handleSave}
              >
                保存
              </button>
            </div>
          )}
        </div>

        <div className="profile-content">
          <div className="avatar-section">
            <div className="avatar-container" onClick={handleAvatarClick}>
              {user.avatar ? (
                <img
                  src={typeof user.avatar === 'string' ? user.avatar : ''}
                  alt="用户头像"
                  className="user-avatar"
                />
              ) : (
                <div className="default-avatar">
                  <User size={48} />
                </div>
              )}
              <div className="avatar-overlay">
                <Edit size={20} color="white" />
              </div>
            </div>
          </div>

          {!isEditing ? (
            <div className="info-section">
              <div className="info-item">
                <User size={20} className="info-icon" />
                <div>
                  <h3>姓名</h3>
                  <p>{user.name}</p>
                </div>
              </div>
              <div className="info-item">
                <Mail size={20} className="info-icon" />
                <div>
                  <h3>电子邮箱</h3>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className="info-item">
                <Calendar size={20} className="info-icon" />
                <div>
                  <h3>加入日期</h3>
                  <p>{user.joinDate}</p>
                </div>
              </div>
              <div className="info-item bio-item">
                <h3>个人简介</h3>
                <p>{user.bio}</p>
              </div>
            </div>
          ) : (
            <div className="edit-section">
              <div className="form-group">
                <label htmlFor="name">姓名</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="bio">个人简介</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={editForm.bio}
                  onChange={handleEditChange}
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>

        <div className="security-section">
          <h2>账号安全</h2>
          <div className="security-item">
            <div>
              <h3>修改密码</h3>
              <p>定期更改密码以确保账号安全</p>
            </div>
            <button className="security-button">
              <Lock size={16} /> 修改
            </button>
          </div>
          <div className="security-item">
            <div>
              <h3>邮箱验证</h3>
              <p>已验证: {user.email}</p>
            </div>
            <button className="security-button">
              <Mail size={16} /> 重新验证
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;