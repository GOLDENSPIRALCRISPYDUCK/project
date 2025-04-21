import React, { useState } from 'react';
import { Search, BookOpen, Thermometer, Leaf, HeartPulse } from 'lucide-react';

// 知识库数据
const knowledgeData = [
  {
    id: 1,
    title: '风寒感冒',
    category: '感冒类型',
    content: '风寒感冒是因感受风寒邪气所致，主要症状为恶寒重、发热轻、无汗、头痛身痛、鼻塞流清涕、咳嗽吐稀白痰、口不渴或渴喜热饮、苔薄白。治疗以辛温解表为主。',
    treatments: [
      '葱白生姜汤：葱白3根，生姜3片，红糖适量，水煎温服',
      '荆防败毒散：荆芥、防风、羌活、独活、柴胡、前胡、川芎、枳壳、茯苓、桔梗、甘草'
    ],
    prevention: '注意保暖，避免受凉；适当运动增强体质；饮食宜温热'
  },
  {
    id: 2,
    title: '风热感冒',
    category: '感冒类型',
    content: '风热感冒是因感受风热邪气所致，主要症状为发热重、微恶风、头胀痛、有汗、咽喉红肿疼痛、咳嗽、痰粘或黄、鼻塞黄涕、口渴喜饮、舌尖边红、苔薄白微黄。治疗以辛凉解表为主。',
    treatments: [
      '银翘散：金银花、连翘、桔梗、薄荷、竹叶、生甘草、荆芥穗、淡豆豉、牛蒡子',
      '桑菊饮：桑叶、菊花、杏仁、连翘、薄荷、桔梗、甘草、芦根'
    ],
    prevention: '保持室内通风；多饮水；避免辛辣刺激性食物'
  },
  {
    id: 3,
    title: '预防流感食疗方',
    category: '预防方法',
    content: '中医认为"正气存内，邪不可干"，通过食疗增强体质是预防流感的重要方法。',
    treatments: [
      '玉屏风散：黄芪、白术、防风，可增强免疫力',
      '姜枣茶：生姜3片，红枣5枚，红糖适量，水煎代茶饮'
    ],
    prevention: '平时可多食用山药、红枣、枸杞等补益脾肺的食物'
  },
  {
    id: 4,
    title: '流感恢复期调理',
    category: '康复调理',
    content: '流感后期常见气阴两虚，表现为乏力、口干、食欲不振等，需注意调理。',
    treatments: [
      '生脉饮：人参、麦冬、五味子',
      '沙参麦冬汤：沙参、玉竹、生甘草、冬桑叶、麦冬、生扁豆、花粉'
    ],
    prevention: '避免劳累；饮食清淡易消化；可适量食用百合、银耳等滋阴食物'
  },
    {
    id: 5,
    title: '暑湿感冒',
    category: '感冒类型',
    content: '多发于夏季，因感受暑湿邪气所致，主要症状为发热、汗出不畅、头身困重、胸闷恶心、食欲不振、舌苔黄腻。治疗以清暑祛湿解表为主。',
    treatments: [
      '新加香薷饮：香薷、厚朴、扁豆花、金银花、连翘',
      '藿香正气散：藿香、紫苏、白芷、大腹皮、茯苓、白术、陈皮、半夏、厚朴、桔梗、甘草'
    ],
    prevention: '夏季避免贪凉饮冷；保持环境干燥通风；适量饮用藿香、佩兰等芳香化湿之品'
  },
  {
    id: 6,
    title: '气虚感冒',
    category: '感冒类型',
    content: '多见于体虚者，症状为反复感冒、恶寒发热、头痛鼻塞、咳嗽痰白、气短乏力、舌淡苔白。治疗以益气解表为主。',
    treatments: [
      '参苏饮：人参、紫苏叶、葛根、前胡、半夏、茯苓、陈皮、甘草、桔梗、枳壳、木香',
      '玉屏风散合桂枝汤：黄芪、白术、防风、桂枝、白芍、生姜、大枣、甘草'
    ],
    prevention: '平时可服用玉屏风散增强卫气；适当锻炼如太极拳、八段锦；避免过度劳累'
  },
  {
    id: 7,
    title: '艾灸预防法',
    category: '预防方法',
    content: '通过艾灸特定穴位激发正气，提高免疫力，达到预防流感的效果。',
    treatments: [
      '足三里穴：健脾益胃，强壮保健要穴',
      '大椎穴：振奋阳气，提高抵抗力',
      '肺俞穴：补益肺气，增强卫外功能'
    ],
    prevention: '每周艾灸2-3次，每个穴位灸10-15分钟，注意避免烫伤'
  },
  {
    id: 8,
    title: '拔罐疗法',
    category: '治疗方法',
    content: '通过负压作用于体表穴位，达到祛风散寒、活血通络的效果，适用于风寒型流感。',
    treatments: [
      '背部膀胱经走罐：沿脊柱两侧上下推动罐具',
      '定罐大椎、风门、肺俞等穴位',
      '配合刺络拔罐效果更佳'
    ],
    prevention: '治疗时间不宜过长，5-10分钟为宜；体质虚弱者慎用'
  },
  {
    id: 9,
    title: '食疗调理方',
    category: '康复调理',
    content: '根据不同证型选择适宜食材，促进康复。',
    treatments: [
      '风寒型：葱豉汤（葱白、淡豆豉）加红糖',
      '风热型：桑菊薄荷饮（桑叶、菊花、薄荷）',
      '暑湿型：荷叶薏米粥（鲜荷叶、薏苡仁、粳米）',
      '气虚型：黄芪红枣粥（黄芪、红枣、粳米）'
    ],
    prevention: '康复期饮食宜清淡易消化，循序渐进增加营养'
  },
  {
    id: 10,
    title: '情志调养',
    category: '预防方法',
    content: '中医认为"精神内守，病安从来"，保持良好心态有助于预防疾病。',
    treatments: [
      '静坐冥想：每日15-20分钟',
      '音乐疗法：聆听舒缓的宫调音乐',
      '导引功法：如五禽戏、八段锦'
    ],
    prevention: '避免过度紧张焦虑；培养兴趣爱好；保持规律作息'
  }

];

const Preprocessing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedItem, setSelectedItem] = useState(null);

  // 获取所有分类
  const categories = ['全部', ...new Set(knowledgeData.map(item => item.category))];

  // 过滤数据
  const filteredData = knowledgeData.filter(item => {
    const matchesSearch = item.title.includes(searchTerm) ||
                         item.content.includes(searchTerm);
    const matchesCategory = selectedCategory === '全部' ||
                          item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 渲染分类图标
  const renderCategoryIcon = (category) => {
    switch(category) {
      case '感冒类型':
        return <Thermometer className="w-5 h-5 mr-2" />;
      case '预防方法':
        return <Leaf className="w-5 h-5 mr-2" />;
      case '康复调理':
        return <HeartPulse className="w-5 h-5 mr-2" />;
      default:
        return <BookOpen className="w-5 h-5 mr-2" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BookOpen className="h-8 w-8 text-green-600 mr-3" />
            中医流感知识库
          </h1>
          <p className="mt-2 text-gray-600">
            汇集传统中医对流感的认识、预防和治疗方法
          </p>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 搜索和筛选区 */}
        <div className="px-4 pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="搜索中医流感知识..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {renderCategoryIcon(category)}
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 内容展示区 */}
        <div className="px-4">
          {selectedItem ? (
            // 详细内容视图
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="mb-4 flex items-center text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  返回列表
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedItem.title}</h2>
                <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                  {selectedItem.category}
                </div>

                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">症状特点</h3>
                  <p className="text-gray-700 mb-6">{selectedItem.content}</p>

                  <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">治疗方法</h3>
                  <ul className="list-disc pl-5 space-y-2 mb-6">
                    {selectedItem.treatments.map((treatment, index) => (
                      <li key={index} className="text-gray-700">{treatment}</li>
                    ))}
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">预防建议</h3>
                  <p className="text-gray-700">{selectedItem.prevention}</p>
                </div>
              </div>
            </div>
          ) : (
            // 列表视图
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="p-6">
                      <div className="flex items-center">
                        {renderCategoryIcon(item.category)}
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="mt-2 text-xl font-semibold text-gray-800">{item.title}</h3>
                      <p className="mt-3 text-gray-600 line-clamp-3">{item.content}</p>
                      <div className="mt-4 flex items-center text-green-600 hover:text-green-800">
                        <span>查看更多</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">未找到相关内容</h3>
                  <p className="mt-1 text-gray-500">请尝试其他搜索词或分类</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} 岐黄御瘟 - 中医流感知识库. 传承中医智慧.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Preprocessing;
