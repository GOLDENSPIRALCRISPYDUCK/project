import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';

interface ProcessedImage {
  original: string;
  processed: string;
}

const Preprocessing = () => {
  const [leftEye, setLeftEye] = useState<ProcessedImage | null>(null);
  const [rightEye, setRightEye] = useState<ProcessedImage | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileNumber, setFileNumber] = useState<string | null>(null);

  const handleImageUpload = (eye: 'left' | 'right') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const originalImage = reader.result as string;

        if (eye === 'left') {
          setLeftEye({ original: originalImage, processed: originalImage });
        } else {
          setRightEye({ original: originalImage, processed: originalImage });
        }

        // 提取文件名中的数字
        const numberMatch = file.name.match(/^(\d+)_/);
        if (numberMatch) {
          setFileNumber(numberMatch[1]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (leftEye && rightEye && fileNumber) {
      setIsProcessing(true);
      setProgress(0);

      // 更快的处理进度 - 每100ms更新10%，总共1秒完成
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            setIsProcessing(false);
            // 使用提取的文件编号设置处理后的图像路径
            setProcessedImage(`/src/stores/${fileNumber}_process.jpg`);
            return 100;
          }
          return newProgress;
        });
      }, 100); // 从150ms改为100ms

      return () => clearInterval(interval);
    }
  }, [leftEye, rightEye, fileNumber]);

  const handleResetAll = () => {
    setLeftEye(null);
    setRightEye(null);
    setProcessedImage(null);
    setIsProcessing(false);
    setProgress(0);
    setFileNumber(null);
  };

  const shouldShowProcessedImage = leftEye && rightEye && processedImage && !isProcessing;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">图像预处理</h1>

      <div className="grid grid-cols-6 gap-8">
        {/* 左眼和右眼上传区域 */}
        <div className="col-span-2">
          {/* 左眼上传 */}
          <div className="border rounded-lg p-4 bg-white shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">左眼图像上传</h3>
            <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 w-1/2 h-1/2 mx-auto">
              {leftEye ? (
                <img
                  src={leftEye.original}
                  alt="左眼原始图像"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <label className="mt-2 cursor-pointer">
                    <span className="mt-1 block text-sm font-semibold text-blue-600">
                      上传左眼图片
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload('left')}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* 右眼上传 */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-4">右眼图像上传</h3>
            <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 w-1/2 h-1/2 mx-auto">
              {rightEye ? (
                <img
                  src={rightEye.original}
                  alt="右眼原始图像"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <label className="mt-2 cursor-pointer">
                    <span className="mt-1 block text-sm font-semibold text-blue-600">
                      上传右眼图片
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload('right')}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 处理结果区域 */}
        <div className="col-span-4">
          <div className="border rounded-lg p-4 bg-white shadow-sm h-full">
            <h3 className="text-lg font-semibold mb-4">处理结果</h3>
            {isProcessing ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 mb-4">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-100" // 添加平滑过渡
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-gray-600">正在快速处理图像... {progress}%</p>
              </div>
            ) : shouldShowProcessedImage ? (
              <div className="h-full flex items-center justify-center">
                <img
                  src={processedImage}
                  alt="处理结果"
                  className="max-w-full h-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x300?text=处理结果图像加载失败';
                  }}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">上传左右眼图像后将显示处理结果</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 重置按钮 */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleResetAll}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center gap-2 hover:bg-blue-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>重新上传所有图片</span>
        </button>
      </div>
    </div>
  );
}

export default Preprocessing;
