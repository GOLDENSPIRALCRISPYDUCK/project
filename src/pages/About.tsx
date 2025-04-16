import React, { useState } from 'react';

const About = () => {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<Array<{role: string, content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      alert('请输入有效症状描述');
      return;
    }

    if (input.toLowerCase() === '退出' || input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      setConversation([...conversation, { role: 'assistant', content: '感谢使用，请以专业医生诊断为准！' }]);
      return;
    }

    // 添加用户输入到对话历史
    const updatedConversation = [...conversation, { role: 'user', content: input }];
    setConversation(updatedConversation);
    setInput('');
    setIsLoading(true);

    try {
      // 直接调用 OpenAI API
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-1f01993e12054856a15114d4861bacfe'
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `你是一名专业眼科医生助手，请用通俗语言回答：
1. 可能疾病（按可能性排序）
2. 建议治疗方式（含常用药物通用名）
3. 日常护眼建议
4. 需立即就医的警示症状

注意：
- 药物需注明成人用量
- 标注'请及时就医'的严重情况
- 最后注明'本建议仅供参考'`
            },
            { role: "user", content: input }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.choices[0].message.content;

      setConversation([...updatedConversation, {
        role: 'assistant',
        content: assistantResponse
      }]);
    } catch (error) {
      console.error('API调用失败:', error);
      setConversation([...updatedConversation, {
        role: 'assistant',
        content: '抱歉，获取诊断建议时出错，请稍后再试。'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold mb-4">睛准视界-眼科疾病辅助诊断小助手</h2>
        <p className="mb-6">请输入患者的眼部症状，输入"退出"结束</p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {conversation.map((item, index) => (
            <div
              key={index}
              className={`mb-4 p-4 rounded-lg ${item.role === 'user' ? 'bg-blue-50 ml-auto' : 'bg-gray-100'}`}
            >
              <p className="font-semibold">{item.role === 'user' ? '您' : '助手'}:</p>
              <p className="whitespace-pre-wrap">{item.content}</p>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请输入患者症状描述..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-r-lg transition duration-200"
              disabled={isLoading}
            >
              {isLoading ? '处理中...' : '发送'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-bold text-yellow-800">免责声明</h3>
          <p className="text-yellow-700">本助手提供的诊断建议仅供参考，不能替代专业医生的诊断和治疗。如有紧急情况，请立即就医。</p>
        </div>
      </div>
    </div>
  );
};

export default About;
