import React, { useState } from 'react';

const TCMDiagnosis = () => {
  const [input, setInput] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      alert('请输入有效症状描述');
      return;
    }

    setIsLoading(true);
    setDiagnosisResult('');

    try {
      // 调用DeepSeek API进行中医诊断
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
              content: `您现在是资深中医专家，请根据以下要求提供专业诊断建议：
              
【辨证要点】
1. 四诊合参（望闻问切）
2. 八纲辨证（阴阳表里寒热虚实）
3. 脏腑经络定位

【处方建议】
1. 主方选择（注明出处如《伤寒论》）
2. 剂量范围（按2020版药典）
3. 加减化裁（根据具体症状）
4. 煎服方法

【注意事项】
- 标注药物禁忌
- 提示可能的不良反应
- 建议复诊时间
- 最后注明"具体用药需经执业中医师面诊确认"`
            },
            { role: "user", content: input }
          ],
          temperature: 0.2,  // 保持严谨性
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const data = await response.json();
      setDiagnosisResult(data.choices[0].message.content);
    } catch (error) {
      console.error('诊断失败:', error);
      setDiagnosisResult('系统暂时不可用，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">中医智能辨证系统</h1>
        <p className="text-gray-600">基于深度学习的中医辅助诊断平台</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col space-y-4">
            <label htmlFor="symptoms" className="text-lg font-medium text-gray-700">
              患者症状描述
            </label>
            <textarea
              id="symptoms"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请输入主要症状、持续时间、加重缓解因素等..."
              rows={4}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg text-white font-medium ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  分析中...
                </span>
              ) : '开始辨证'}
            </button>
          </div>
        </form>

        {diagnosisResult && (
          <div className="border-t pt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">辨证结果</h2>
            <div className="prose max-w-none bg-blue-50 p-6 rounded-lg whitespace-pre-wrap">
              {diagnosisResult}
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-bold text-yellow-800">重要提示</h3>
              <p className="text-yellow-700">本系统建议仅供参考，具体诊疗方案需经执业中医师面诊后确定</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TCMDiagnosis;
