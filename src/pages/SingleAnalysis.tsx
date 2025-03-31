import React, { useState } from 'react';
import { Shield, Leaf, Soup, Exercise, Mask, Home } from 'lucide-react';

// 类型定义
interface PreventionItem {
  id: number;
  title: string;
  category: string;
  icon: React.ReactNode;
  tips: string[];
  description: string;
}

// 预防建议数据
const preventionData: PreventionItem[] = [
  {
    id: 1,
    title: '饮食调理预防法',
    category: '食疗预防',
    icon: <Soup style={{ width: '24px', height: '24px', color: '#f97316' }} />,
    tips: [
      '每日饮用姜枣茶：生姜3片，红枣5枚，红糖适量，水煎代茶饮',
      '常食葱蒜：葱白、大蒜具有解毒散寒功效',
      '多喝粥：如百合粥、山药粥可健脾益肺',
      '适量饮用菊花枸杞茶：清肝明目，增强抵抗力'
    ],
    description: '中医认为"药食同源"，通过日常饮食调理可以增强体质，预防流感。冬季宜温补，夏季宜清补，根据季节变化调整饮食结构。'
  },
  // 其他数据保持不变...
];

const PreventionAdvice: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  // 获取所有分类
  const categories: string[] = ['全部', ...new Set(preventionData.map(item => item.category))];

  // 过滤数据
  const filteredData = selectedCategory === '全部'
    ? preventionData
    : preventionData.filter(item => item.category === selectedCategory);

  // 渲染分类图标
  const renderCategoryIcon = (category: string): React.ReactNode => {
    const iconStyle = { width: '20px', height: '20px', marginRight: '8px' };
    switch(category) {
      case '食疗预防':
        return <Soup style={iconStyle} />;
      case '生活起居':
        return <Home style={iconStyle} />;
      // 其他分类图标...
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* 头部 */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center' }}>
            <Shield style={{ height: '32px', width: '32px', color: '#16a34a', marginRight: '12px' }} />
            中医流感预防建议
          </h1>
          <p style={{ marginTop: '8px', color: '#4b5563' }}>
            传统中医智慧与现代科学结合的流感预防方法
          </p>
        </div>
      </header>

      {/* 主内容区 */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 0' }}>
        {/* 分类筛选区 */}
        <div style={{ padding: '0 16px', paddingBottom: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setExpandedCard(null);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: selectedCategory === category ? '#dcfce7' : 'white',
                  color: selectedCategory === category ? '#166534' : '#374151',
                  border: selectedCategory === category ? '1px solid #86efac' : '1px solid #d1d5db',
                }}
              >
                {renderCategoryIcon(category)}
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 内容展示区 */}
        <div style={{ padding: '0 16px' }}>
          <div style={{
            display: 'grid',
            gap: '24px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
          }}>
            {filteredData.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'white',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  transition: 'all 0.3s',
                  border: expandedCard === item.id ? '2px solid #22c55e' : 'none'
                }}
              >
                <div
                  style={{ padding: '24px', cursor: 'pointer' }}
                  onClick={() => setExpandedCard(prev => prev === item.id ? null : item.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '9999px',
                      marginRight: '16px',
                      backgroundColor: 'rgba(249, 115, 22, 0.1)' // 根据实际图标颜色调整
                    }}>
                      {React.cloneElement(item.icon as React.ReactElement, { style: { width: '24px', height: '24px' } })}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>{item.title}</h3>
                      <div style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        padding: '4px 8px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: '#f3f4f6',
                        color: '#1f2937'
                      }}>
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <p style={{ marginTop: '12px', color: '#4b5563' }}>{item.description}</p>

                  {expandedCard === item.id && (
                    <div style={{ marginTop: '16px' }}>
                      <h4 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>具体建议：</h4>
                      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px' }}>
                        {item.tips.map((tip, index) => (
                          <li key={index} style={{ color: '#374151', marginBottom: '8px' }}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCard(prev => prev === item.id ? null : item.id);
                      }}
                      style={{
                        fontSize: '14px',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {expandedCard === item.id ? '收起详情' : '查看更多建议'}
                      <svg
                        style={{
                          width: '16px',
                          height: '16px',
                          marginLeft: '4px',
                          transform: expandedCard === item.id ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.3s'
                        }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PreventionAdvice;