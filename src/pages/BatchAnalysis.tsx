import React, { useState } from 'react';
import { Upload, ChevronLeft, ChevronRight, Download, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

interface EyeAnalysis {
  image: string;
  disease: string;
}

interface CombinedDiagnosis {
  primaryDisease: string;
}

interface PatientAnalysis {
  id: number;
  leftEye: EyeAnalysis;
  rightEye: EyeAnalysis;
  combinedDiagnosis: CombinedDiagnosis;
  patientName?: string;
}

const excelData = [
  { left: "0_left.jpg", right: "0_right.jpg", normal: 0, diabetes: 0, glaucoma: 0, cataract: 1, AMD: 0, hypertension: 0, myopia: 0, other: 0 },
];

const BatchAnalysis = () => {
  const [patients, setPatients] = useState<PatientAnalysis[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploadStep, setUploadStep] = useState<'initial' | 'leftEye' | 'rightEye'>('initial');
  const [tempLeftEyes, setTempLeftEyes] = useState<string[]>([]);
  const [tempRightEyes, setTempRightEyes] = useState<string[]>([]);

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
    if (files) {
      const leftEyeImages: string[] = new Array(files.length).fill('');
      let loadedCount = 0;

      Array.from(files).forEach((file) => {
        if (!isValidFileName(file.name, 'left')) {
          alert('左眼图片文件名格式不正确，请确保文件名为 {index}_left.jpg');
          return;
        }

        const index = getIndexFromFileName(file.name);
        if (index === -1) {
          alert('文件名格式错误，无法解析下标');
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          leftEyeImages[index] = reader.result as string;
          loadedCount++;

          if (loadedCount === files.length) {
            setTempLeftEyes(leftEyeImages);
            setUploadStep('rightEye');
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRightEyesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const rightEyeImages: string[] = new Array(files.length).fill('');
      let loadedCount = 0;

      Array.from(files).forEach((file) => {
        if (!isValidFileName(file.name, 'right')) {
          alert('右眼图片文件名格式不正确，请确保文件名为 {index}_right.jpg');
          return;
        }

        const index = getIndexFromFileName(file.name);
        if (index === -1) {
          alert('文件名格式错误，无法解析下标');
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          rightEyeImages[index] = reader.result as string;
          loadedCount++;

          if (loadedCount === files.length) {
            setTempRightEyes(rightEyeImages);
            processPatientData(tempLeftEyes, rightEyeImages);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const getDiseaseFromRow = (row: any) => {
    const diseases = [
      { name: "正常", value: row.normal },
      { name: "糖尿病", value: row.diabetes },
      { name: "青光眼", value: row.glaucoma },
      { name: "白内障", value: row.cataract },
      { name: "AMD", value: row.AMD },
      { name: "高血压", value: row.hypertension },
      { name: "近视", value: row.myopia },
      { name: "其他疾病/异常", value: row.other },
    ];

    // 过滤出所有值为 1 的病症
    const activeDiseases = diseases.filter((d) => d.value === 1);

    // 如果没有找到任何病症，返回 "未知"
    if (activeDiseases.length === 0) {
       return "未知";
    }

    // 将所有病症名称拼接成一个字符串
    return activeDiseases.map((d) => d.name).join(", ");
};

  const processPatientData = (leftEyes: string[], rightEyes: string[]) => {
  if (leftEyes.length !== rightEyes.length) {
    alert('左右眼图片数量不一致，请重新上传！');
    return;
  }

  const newPatients: PatientAnalysis[] = [];

  for (let i = 0; i < leftEyes.length; i++) {
    const leftImageName = `${i}_left.jpg`;
    const rightImageName = `${i}_right.jpg`;

    const matchedRow = excelData.find(
      (row) => row.left === leftImageName && row.right === rightImageName
    );

    const primaryDisease = matchedRow ? getDiseaseFromRow(matchedRow) : "未知";

    const leftEyeAnalysis: EyeAnalysis = {
      image: leftEyes[i],
      disease: primaryDisease,
    };

    const rightEyeAnalysis: EyeAnalysis = {
      image: rightEyes[i],
      disease: primaryDisease,
    };

    const combinedDiagnosis: CombinedDiagnosis = {
      primaryDisease,
    };

    newPatients.push({
      id: i,
      leftEye: leftEyeAnalysis,
      rightEye: rightEyeAnalysis,
      combinedDiagnosis,
      patientName: `患者 ${i + 1}`,
    });
  }

  setPatients(newPatients);
  setUploadStep('initial');
  setCurrentIndex(0);
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
  };

  const handleDownloadReport = () => {
    const excelData = patients.map((patient) => ({
      患者编号: patient.patientName,
      综合诊断结果: patient.combinedDiagnosis.primaryDisease,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
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

  const CombinedDiagnosisSection = ({ diagnosis }: { diagnosis: CombinedDiagnosis }) => (
  <div className="border rounded-lg p-6 bg-white shadow-md">
    <h2 className="text-xl font-semibold mb-4">综合诊断结果</h2>
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg text-blue-900">主要诊断</h3>
        <p className="text-blue-800 text-lg">{diagnosis.primaryDisease}</p>
      </div>
    </div>
  </div>
);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">批量影像分析</h1>
        {patients.length > 0 && (
          <button
            onClick={handleDownloadReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            下载分析报告
          </button>
        )}
      </div>

      {patients.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
          <div className="text-center">
            {uploadStep === 'initial' && (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold">https://open.bigmodel.cn/shareapp/v1?share_code=O4rIrbVfmNlOACdHxP20x</h3>
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
                  <p className="text-gray-500 mb-4">请选择所有患者的左眼图像</p>
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
                  <p className="text-gray-500 mb-4">请选择所有患者的右眼图像（请确保顺序与左眼相对应）</p>
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

          <CombinedDiagnosisSection diagnosis={patients[currentIndex].combinedDiagnosis} />

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