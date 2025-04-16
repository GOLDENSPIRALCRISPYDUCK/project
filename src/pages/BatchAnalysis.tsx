import React, { useState, useEffect } from 'react';
import { Upload, ChevronLeft, ChevronRight, Download, RefreshCw, Loader2 } from 'lucide-react';
declare const XLSX: any;

interface EyeAnalysis {
  image: string;
  disease: string;
}

interface CombinedDiagnosis {
  primaryDisease: string;
}

interface TreatmentSuggestion {
  primaryDisease: string;
  suggestions: string;
}

interface PatientAnalysis {
  id: number;
  leftEye: EyeAnalysis;
  rightEye: EyeAnalysis;
  combinedDiagnosis: CombinedDiagnosis;
  patientName?: string;
  treatmentSuggestion?: TreatmentSuggestion;
}

const BatchAnalysis = () => {
  const [patients, setPatients] = useState<PatientAnalysis[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploadStep, setUploadStep] = useState<'initial' | 'leftEye' | 'rightEye'>('initial');
  const [tempLeftEyes, setTempLeftEyes] = useState<{index: number, image: string}[]>([]);
  const [tempRightEyes, setTempRightEyes] = useState<{index: number, image: string}[]>([]);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const loadExcelData = async () => {
    try {
      const response = await fetch('/store/data1.xlsx');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const processedData = data.map(row => ({
        ...row,
        正常: parseInt(row['正常']),
        糖尿病: parseInt(row['糖尿病']),
        青光眼: parseInt(row['青光眼']),
        白内障: parseInt(row['白内障']),
        AMD: parseInt(row['AMD']),
        高血压: parseInt(row['高血压']),
        近视: parseInt(row['近视']),
        '其他疾病/异常': parseInt(row['其他疾病/异常 ']),
        LeftFundus: row['Left-Fundus'],
        RightFundus: row['Right-Fundus']
      }));

      setExcelData(processedData);
    } catch (error) {
      console.error('读取 Excel 文件时出错:', error);
    }
  };

  useEffect(() => {
    loadExcelData();
  }, []);

  const isValidFileName = (fileName: string, type: 'left' | 'right') => {
    const regex = new RegExp(`^\\d+_${type}\\.(jpg|jpeg|png)$`, 'i');
    return regex.test(fileName);
  };

  const getIndexFromFileName = (fileName: string) => {
    const match = fileName.match(/^(\d+)_/);
    return match ? parseInt(match[1], 10) : -1;
  };

  const handleLeftEyesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setTempLeftEyes([]);
    setTempRightEyes([]);

    const uploadPromises = Array.from(files).map(file => {
      return new Promise<{ index: number, image: string }>((resolve, reject) => {
        if (!isValidFileName(file.name, 'left')) {
          alert(`左眼图片文件名格式不正确，请确保文件名为 {index}_left.jpg，当前文件: ${file.name}`);
          return reject();
        }

        const index = getIndexFromFileName(file.name);
        if (index === -1) {
          alert(`文件名格式错误，无法解析下标: ${file.name}`);
          return reject();
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ index, image: reader.result as string });
        };
        reader.onerror = () => reject();
        reader.readAsDataURL(file);
      });
    });

    Promise.all(uploadPromises.filter(p => p)).then(results => {
      const validResults = results.filter(r => r) as {index: number, image: string}[];
      setTempLeftEyes(validResults);
      setUploadStep('rightEye');
    });
  };

  const handleRightEyesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const uploadPromises = Array.from(files).map(file => {
      return new Promise<{ index: number, image: string }>((resolve, reject) => {
        if (!isValidFileName(file.name, 'right')) {
          alert(`右眼图片文件名格式不正确，请确保文件名为 {index}_right.jpg，当前文件: ${file.name}`);
          return reject();
        }

        const index = getIndexFromFileName(file.name);
        if (index === -1) {
          alert(`文件名格式错误，无法解析下标: ${file.name}`);
          return reject();
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ index, image: reader.result as string });
        };
        reader.onerror = () => reject();
        reader.readAsDataURL(file);
      });
    });

    Promise.all(uploadPromises.filter(p => p)).then(results => {
      const validResults = results.filter(r => r) as {index: number, image: string}[];
      setTempRightEyes(validResults);
      simulateBatchAnalysis(tempLeftEyes, validResults);
    });
  };

  const simulateBatchAnalysis = async (leftEyes: {index: number, image: string}[], rightEyes: {index: number, image: string}[]) => {
    setIsAnalyzing(true);
    setProgress(0);

    const totalSteps = 1;
    const intervalTime = 1000;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const newProgress = Math.floor((currentStep / totalSteps) * 100);
      setProgress(newProgress);

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        const results = processPatientData(leftEyes, rightEyes);
        setPatients(results);
        setIsAnalyzing(false);
        setUploadStep('initial');
        setCurrentIndex(0);
      }
    }, intervalTime);
  };

  const getDiseaseFromRow = (row: any) => {
    const diseases = [
      { name: "正常", value: row['正常'] },
      { name: "糖尿病", value: row['糖尿病'] },
      { name: "青光眼", value: row['青光眼'] },
      { name: "白内障", value: row['白内障'] },
      { name: "AMD", value: row['AMD'] },
      { name: "高血压", value: row['高血压'] },
      { name: "近视", value: row['近视'] },
      { name: "其他疾病/异常", value: row['其他疾病/异常'] }
    ];

    const activeDiseases = diseases.filter((d) => d.value === 1);
    return activeDiseases.map((d) => d.name).join(", ") || "未知";
  };

  const getDiagnosisAdvice = (disease: string) => {
    const diseases = disease.split(', ');
    let advice = "";

    diseases.forEach((singleDisease) => {
      if (singleDisease.includes("糖尿病")) {
        advice += `糖尿病视网膜病变诊疗建议：严格控制血糖水平，定期监测糖化血红蛋白；定期进行眼科检查，及时发现并治疗视网膜病变；必要时进行激光治疗或手术治疗。\n\n`;
      } else if (singleDisease.includes("青光眼")) {
        advice += `青光眼诊疗建议：定期进行眼压测量和视野检查；遵医嘱使用降眼压药物，如滴眼液或口服药物；必要时进行激光治疗或手术治疗，以控制眼压并保护视神经。\n\n`;
      } else if (singleDisease.includes("白内障")) {
        advice += `白内障诊疗建议：定期进行眼科检查，关注晶状体混浊程度；当视力下降到影响日常生活时，可考虑进行白内障手术治疗，如超声乳化手术或囊外摘除术。\n\n`;
      } else if (singleDisease.includes("AMD")) {
        advice += `年龄相关性黄斑变性（AMD）诊疗建议：戒烟限酒，保持健康的生活方式；定期进行眼科检查，监测黄斑区变化；在医生指导下使用抗氧化剂、维生素等营养补充剂，或进行激光治疗、光动力疗法等。\n\n`;
      } else if (singleDisease.includes("高血压")) {
        advice += `高血压视网膜病变诊疗建议：严格控制血压水平，遵医嘱按时服用降压药物；定期进行眼科检查，关注眼底血管变化；如有眼底出血、渗出等情况，应及时就医治疗。\n\n`;
      } else if (singleDisease.includes("近视")) {
        advice += `高度近视视网膜病变诊疗建议：定期进行视力检查，关注近视度数变化；根据近视度数配戴合适的眼镜或隐形眼镜；注意用眼卫生，避免长时间近距离用眼；必要时可考虑进行近视矫正手术。\n\n`;
      } else if (singleDisease.includes("其他疾病/异常")) {
        advice += `其他眼部异常诊疗建议：及时就医，进行详细的眼科检查，明确疾病类型和严重程度；根据医生建议进行治疗，如药物治疗、手术治疗等；注意眼部卫生，避免揉眼等不良习惯。\n\n`;
      } else if (singleDisease.includes("正常")) {
        advice += `检查结果正常：保持健康用眼习惯，如每用眼40分钟休息5-10分钟，远眺放松；定期进行眼科检查，预防眼部疾病的发生。\n\n`;
      }
    });
    return advice.trim();
  };

  const processPatientData = (leftEyes: {index: number, image: string}[], rightEyes: {index: number, image: string}[]) => {
    const newPatients: PatientAnalysis[] = [];

    // 创建索引映射以便快速查找
    const leftEyeMap = new Map<number, string>();
    leftEyes.forEach(item => leftEyeMap.set(item.index, item.image));

    const rightEyeMap = new Map<number, string>();
    rightEyes.forEach(item => rightEyeMap.set(item.index, item.image));

    // 获取所有唯一的索引
    const allIndices = new Set([...leftEyes.map(item => item.index), ...rightEyes.map(item => item.index)]);

    allIndices.forEach(index => {
      const leftImage = leftEyeMap.get(index);
      const rightImage = rightEyeMap.get(index);

      if (!leftImage || !rightImage) {
        console.warn(`索引 ${index} 的左右眼图像不完整，跳过处理`);
        return;
      }

      const leftImageName = `${index}_left.jpg`;
      const rightImageName = `${index}_right.jpg`;

      const matchedRow = excelData.find(
        (row) => row.LeftFundus === leftImageName && row.RightFundus === rightImageName
      );

      if (!matchedRow) {
        console.warn(`未找到索引 ${index} 对应的Excel数据，文件名: ${leftImageName}, ${rightImageName}`);
        return;
      }

      const primaryDisease = getDiseaseFromRow(matchedRow);
      const advice = getDiagnosisAdvice(primaryDisease);

      newPatients.push({
        id: index,
        leftEye: {
          image: leftImage,
          disease: primaryDisease,
        },
        rightEye: {
          image: rightImage,
          disease: primaryDisease,
        },
        combinedDiagnosis: {
          primaryDisease,
        },
        patientName: `患者 ${index + 1}`,
        treatmentSuggestion: {
          primaryDisease,
          suggestions: advice
        }
      });
    });

    // 按索引排序
    return newPatients.sort((a, b) => a.id - b.id);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < patients.length - 1 ? prev + 1 : prev));
  };

  const resetAnalysis = () => {
    setPatients([]);
    setTempLeftEyes([]);
    setTempRightEyes([]);
    setUploadStep('initial');
    setIsAnalyzing(false);
    setProgress(0);
    setCurrentIndex(0);
    loadExcelData();
  };

  const handleDownloadReport = () => {
    const excelDataForReport = patients.map((patient) => ({
      患者编号: patient.patientName,
      综合诊断结果: patient.combinedDiagnosis.primaryDisease,
      诊疗建议: patient.treatmentSuggestion?.suggestions
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelDataForReport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "诊断报告");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagnosis_report.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const CombinedDiagnosisSection = ({ diagnosis, isAnalyzing, progress }: {
    diagnosis: CombinedDiagnosis | null,
    isAnalyzing: boolean,
    progress: number
  }) => (
    <div className="border rounded-lg p-6 bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4">综合诊断结果</h2>
      {isAnalyzing ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
            <span>正在批量分析图像 ({progress}%)...</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      ) : diagnosis ? (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg text-blue-900">主要诊断</h3>
            <p className="text-blue-800 text-lg">{diagnosis.primaryDisease}</p>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          <Loader2 className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2">需要上传两眼图像后才能生成综合诊断</p>
        </div>
      )}
    </div>
  );

  const TreatmentSuggestionSection = ({ suggestion }: { suggestion: TreatmentSuggestion }) => (
    <div className="border rounded-lg p-6 bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4">辅助诊疗建议</h2>
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="text-green-800 whitespace-pre-line">{suggestion.suggestions}</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">批量影像分析</h1>
        {patients.length > 0 && !isAnalyzing && (
          <button
            onClick={handleDownloadReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            下载分析报告
          </button>
        )}
      </div>

      {patients.length === 0 && !isAnalyzing ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
          <div className="text-center">
            {uploadStep === 'initial' && (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold">批量上传左右眼图像</h3>
                <p className="text-gray-500 mb-4">请先上传所有左眼图像，然后上传对应的右眼图像</p>
                <button
                  onClick={() => setUploadStep('leftEye')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  开始上传
                </button>
              </>
            )}

            {uploadStep === 'leftEye' && (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <label className="mt-4 cursor-pointer block">
                  <span className="mt-2 block text-lg font-semibold text-blue-600">
                    上传左眼图像 (步骤 1/2)
                  </span>
                  <p className="text-gray-500 mb-4">请选择所有患者的左眼图像（如0_left.jpg, 1_left.jpg等）</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleLeftEyesUpload}
                  />
                  <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block">
                    选择文件
                  </div>
                </label>
              </>
            )}

            {uploadStep === 'rightEye' && (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-green-600 font-semibold">✓ 已上传 {tempLeftEyes.length} 张左眼图像</p>
                <label className="mt-4 cursor-pointer block">
                  <span className="mt-2 block text-lg font-semibold text-blue-600">
                    上传右眼图像 (步骤 2/2)
                  </span>
                  <p className="text-gray-500 mb-4">请选择所有患者的右眼图像（如0_right.jpg, 1_right.jpg等）</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleRightEyesUpload}
                  />
                  <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block">
                    选择文件
                  </div>
                </label>
              </>
            )}
          </div>
        </div>
      ) : isAnalyzing ? (
        <div className="border rounded-lg p-12 text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">正在分析 {tempLeftEyes.length} 对眼底图像</h3>
          <p className="text-gray-600 mb-4">预计需要 30 秒完成分析...</p>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className="bg-blue-600 h-4 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">已完成 {progress}%</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-semibold">{patients[currentIndex].patientName}</h2>
              <span className="text-gray-600">
                {currentIndex + 1} / {patients.length}
              </span>
            </div>
            <button
              onClick={handleNext}
              disabled={currentIndex === patients.length - 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-4">左眼影像</h2>
              <div className="aspect-square border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={patients[currentIndex].leftEye.image}
                  alt="左眼影像"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-4">右眼影像</h2>
              <div className="aspect-square border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={patients[currentIndex].rightEye.image}
                  alt="右眼影像"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          <CombinedDiagnosisSection
            diagnosis={patients[currentIndex].combinedDiagnosis}
            isAnalyzing={false}
            progress={0}
          />

          {patients[currentIndex].treatmentSuggestion && (
            <TreatmentSuggestionSection
              suggestion={patients[currentIndex].treatmentSuggestion}
            />
          )}

          <div className="flex justify-end mt-8">
            <button
              onClick={resetAnalysis}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center gap-2 hover:bg-blue-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>重新上传所有图片</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchAnalysis;
