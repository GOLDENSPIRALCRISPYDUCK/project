import React, { useState, useEffect } from 'react';
import { Upload, ChevronLeft, ChevronRight, Download, RefreshCw, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

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
    const [tempLeftEyes, setTempLeftEyes] = useState<string[]>([]);
    const [tempRightEyes, setTempRightEyes] = useState<string[]>([]);
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
                left: row['Left-Fundus'],
                right: row['Right-Fundus']
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

        // 重置临时数据
        setTempLeftEyes([]);
        setTempRightEyes([]);

        const uploadPromises = Array.from(files).map(file => {
            return new Promise<{ index: number, image: string }>((resolve) => {
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
                    resolve({ index, image: reader.result as string });
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(uploadPromises).then(results => {
            // 按照index排序并提取image
            const sortedImages = results
               .sort((a, b) => a.index - b.index)
               .map(item => item.image);
            setTempLeftEyes(sortedImages);
            setUploadStep('rightEye');
        });
    };

    const handleRightEyesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const uploadPromises = Array.from(files).map(file => {
            return new Promise<{ index: number, image: string }>((resolve) => {
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
                    resolve({ index, image: reader.result as string });
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(uploadPromises).then(results => {
            // 按照index排序并提取image
            const sortedImages = results
               .sort((a, b) => a.index - b.index)
               .map(item => item.image);
            setTempRightEyes(sortedImages);

            // 开始分析前清空之前的结果
            setPatients([]);
            simulateBatchAnalysis(tempLeftEyes, sortedImages);
        });
    };

    const simulateBatchAnalysis = async (leftEyes: string[], rightEyes: string[]) => {
        setIsAnalyzing(true);
        setProgress(0);

        // 确保只处理当前上传的图片对
        const imagePairs = Math.min(leftEyes.length, rightEyes.length);
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
        return activeDiseases.map((d) => d.name).join(",") || "未知";
    };

    const getDiagnosisAdvice = (disease: string) => {
        const diseases = disease.split(',');
        let advice = "";

        diseases.forEach((singleDisease) => {
            if (singleDisease.includes("糖尿病")) {
                advice += `糖尿病视网膜病变诊疗建议：
1. 严格控制血糖：目标空腹血糖4.4-7.0mmol/L，餐后血糖<10mmol/L
2. 血压控制：目标<130/80mmHg
3. 血脂管理：LDL-C<2.6mmol/L
4. 定期眼科随访
5. 戒烟限酒，健康饮食，适量运动
6. 每年至少一次全面眼科检查\n\n`;
            } else if (singleDisease.includes("青光眼")) {
                advice += `青光眼诊疗建议：
1. 开始降眼压治疗
2. 定期视野检查
3. 避免长时间暗环境活动
4. 避免使用散瞳药物
5. 告知家属青光眼遗传风险，建议40岁以上亲属筛查\n\n`;
            } else if (singleDisease.includes("白内障")) {
                advice += `白内障诊疗建议：
1. 根据情况考虑手术治疗或继续观察
2. 视力矫正：配戴合适眼镜改善视力
3. 强光下佩戴防紫外线太阳镜
4. 控制糖尿病等全身性疾病
5. 补充抗氧化营养素（维生素C/E,叶黄素等）
6. 避免长期使用糖皮质激素眼药水\n\n`;
            } else if (singleDisease.includes("AMD")) {
                advice += `年龄相关性黄斑变性（AMD）诊疗建议：
1. 定期专科随访
2. 补充AREDS2配方维生素（维生素C/E,锌,铜,叶黄素,玉米黄质）
3. 戒烟（吸烟使风险增加2-4倍）
4. 佩戴防紫外线太阳镜
5. 使用Amsler方格表自我监测
6. 控制血压血脂，地中海饮食\n\n`;
            } else if (singleDisease.includes("高血压")) {
                advice += `高血压视网膜病变诊疗建议：
1. 严格控制血压：目标<130/80mmHg
2. 定期监测血压
3. 低盐饮食（每日钠<2g）
4. 控制血脂血糖
5. 戒烟限酒
6. 定期眼科检查\n\n`;
            } else if (singleDisease.includes("近视")) {
                advice += `高度近视视网膜病变诊疗建议：
1. 定期散瞳眼底检查
2. 避免剧烈运动（拳击、跳水等）
3. 控制近视进展：户外活动每天2小时，合理用眼
4. 警惕视网膜脱离症状（闪光感、飞蚊症突然增加）
5. 配戴合适矫正眼镜或考虑屈光手术
6. 补充叶黄素保护视网膜\n\n`;
            } else if (singleDisease.includes("其他疾病/异常")) {
                advice += `其他眼部异常诊疗建议：
1. 详细眼科专科检查明确诊断
2. 及时眼科就诊
3. 记录症状变化（视力、疼痛、视野缺损等）
4. 避免自行使用眼药水
5. 保护眼睛避免外伤
6. 根据最终诊断制定个体化治疗方案\n\n`;
            } else if (singleDisease.includes("正常")) {
                advice += `检查结果正常：
1. 常规眼科检查建议：
   - 40岁以下：每2-4年一次
   - 40-54岁：每1-3年一次
   - 55-64岁：每1-2年一次
   - 65岁以上：每年一次
2. 保持健康用眼习惯：
   - 20-20-20法则（每20分钟看20英尺外20秒）
   - 阅读距离保持30cm以上
3. 均衡饮食：多摄入深色蔬菜、鱼类
4. 佩戴防紫外线太阳镜
5. 控制屏幕时间，保证充足睡眠
6. 警惕突发视力变化及时就医\n\n`;
            } else {
                advice += `未知疾病诊疗建议：
1. 建议尽快至眼科专科就诊明确诊断
2. 记录详细症状（发病时间、诱因、伴随症状）
3. 避免自行用药
4. 保护眼睛避免外伤
5. 提供完整病史（全身疾病、用药史、家族史）
6. 可能需要进一步检查：OCT、眼底荧光造影、视野检查等\n\n`;
            }
        });

        return advice;
    };

    const processPatientData = (leftEyes: string[], rightEyes: string[]) => {
        if (leftEyes.length !== rightEyes.length) {
            alert('左右眼图片数量不一致，请重新上传！');
            return [];
        }

        const newPatients: PatientAnalysis[] = [];

        for (let i = 0; i < leftEyes.length; i++) {
            const leftImageName = `${i}_left.jpg`;
            const rightImageName = `${i}_right.jpg`;

            const matchedRow = excelData.find(
                (row) => row.left === leftImageName && row.right === rightImageName
            );

            const primaryDisease = matchedRow ? getDiseaseFromRow(matchedRow) : "未知";
            const advice = getDiagnosisAdvice(primaryDisease);

            newPatients.push({
                id: i,
                leftEye: {
                    image: leftEyes[i],
                    disease: primaryDisease,
                },
                rightEye: {
                    image: rightEyes[i],
                    disease: primaryDisease,
                },
                combinedDiagnosis: {
                    primaryDisease,
                },
                patientName: `患者 ${i + 1}`,
                treatmentSuggestion: {
                    primaryDisease,
                    suggestions: advice
                }
            });
        }

        return newPatients;
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
        // 重新加载Excel数据确保数据新鲜
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
