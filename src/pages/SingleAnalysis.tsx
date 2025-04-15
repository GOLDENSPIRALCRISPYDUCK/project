import React, { useState, useEffect } from 'react';
import { Upload, Activity, RefreshCw, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface EyeAnalysis {
    disease: string;
    findings: string[];
}

interface CombinedDiagnosis {
    primaryDisease: string;
    findings: string[];
}

const SingleAnalysis = () => {
    const [leftEyeImage, setLeftEyeImage] = useState<string | null>(null);
    const [rightEyeImage, setRightEyeImage] = useState<string | null>(null);
    const [leftEyeAnalysis, setLeftEyeAnalysis] = useState<EyeAnalysis | null>(null);
    const [rightEyeAnalysis, setRightEyeAnalysis] = useState<EyeAnalysis | null>(null);
    const [combinedDiagnosis, setCombinedDiagnosis] = useState<CombinedDiagnosis | null>(null);
    const [excelData, setExcelData] = useState<any[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [diagnosisAdvice, setDiagnosisAdvice] = useState<string | null>(null);
    const [isAdviceAnalyzing, setIsAdviceAnalyzing] = useState(false);
    const [adviceProgress, setAdviceProgress] = useState(0);

    useEffect(() => {
        const readExcelFile = async () => {
            try {
                const response = await fetch('/store/data.xlsx');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet);
                const processedData = data.map(row => {
                    return {
                        ...row,
                        正常: parseInt(row['正常']),
                        糖尿病: parseInt(row['糖尿病']),
                        青光眼: parseInt(row['青光眼']),
                        白内障: parseInt(row['白内障']),
                        AMD: parseInt(row['AMD']),
                        高血压: parseInt(row['高血压']),
                        近视: parseInt(row['近视']),
                        '其他疾病/异常': parseInt(row['其他疾病/异常 '])
                    };
                });
                console.log('数据列名:', Object.keys(processedData[0]));
                console.log('加载的 Excel 数据:', processedData);
                setExcelData(processedData);
            } catch (error) {
                console.error('读取 Excel 文件时出错:', error);
            }
        };

        readExcelFile();
    }, []);

    const simulateAnalysis = async (fileName: string, eyeColumn: string) => {
        setIsAnalyzing(true);
        setProgress(0);

        // Simulate progress for 1 second
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 10;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return newProgress;
            });
        }, 100);

        // Wait for 1 second before returning the result
        await new Promise(resolve => setTimeout(resolve, 1000));

        const result = analyzeImage(fileName, eyeColumn);
        setIsAnalyzing(false);
        return result;
    };

    const handleImageUpload = (eye: 'left' | 'right') => async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const fileName = file.name;
                if (eye === 'left') {
                    setLeftEyeImage(reader.result as string);
                    const analysis = await simulateAnalysis(fileName, 'Left-Fundus');
                    console.log('左眼分析结果:', analysis);
                    setLeftEyeAnalysis(analysis);
                    updateCombinedDiagnosis(analysis, rightEyeAnalysis);
                } else {
                    setRightEyeImage(reader.result as string);
                    const analysis = await simulateAnalysis(fileName, 'Right-Fundus');
                    console.log('右眼分析结果:', analysis);
                    setRightEyeAnalysis(analysis);
                    updateCombinedDiagnosis(leftEyeAnalysis, analysis);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = (fileName: string, eyeColumn: string): EyeAnalysis | null => {
        const fileNameWithoutExt = fileName.split('.')[0].trim().toLowerCase();
        console.log('正在查找文件名（无扩展名）:', fileNameWithoutExt);
        const row = excelData.find(row => {
            const excelFileName = row[eyeColumn];
            const excelFileNameWithoutExt = excelFileName? excelFileName.split('.')[0].trim().toLowerCase() : '';
            console.log('Excel 文件名（无扩展名）:', excelFileNameWithoutExt);
            const isMatch = excelFileNameWithoutExt === fileNameWithoutExt;
            console.log(`文件名匹配结果: ${fileNameWithoutExt} 与 ${excelFileNameWithoutExt} -> ${isMatch}`);
            return isMatch;
        });
        if (row) {
            console.log('找到匹配行:', row);
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
            const primaryDiseases = diseases.filter(disease => disease.value === 1).map(disease => disease.name);
            let primaryDisease;
            if (primaryDiseases.length > 0) {
                primaryDisease = primaryDiseases.join(',');
            } else {
                primaryDisease = "未知";
            }
            return {
                disease: primaryDisease,
                findings: []
            };
        } else {
            console.log('未找到匹配行');
        }
        return null;
    }

    const handleResetAll = () => {
        setLeftEyeImage(null);
        setRightEyeImage(null);
        setLeftEyeAnalysis(null);
        setRightEyeAnalysis(null);
        setCombinedDiagnosis(null);
        setDiagnosisAdvice(null);
    };

    const updateCombinedDiagnosis = (left: EyeAnalysis | null, right: EyeAnalysis | null) => {
        if (left && right) {
            const primaryDisease = left.disease;
            const allFindings = [...new Set([...left.findings, ...right.findings])];

            setCombinedDiagnosis({
                primaryDisease,
                findings: allFindings
            });
        } else {
            setCombinedDiagnosis(null);
        }
    };

    const getDiagnosisAdvice = (disease: string) => {
        setIsAdviceAnalyzing(true);
        setAdviceProgress(0);

        const interval = setInterval(() => {
            setAdviceProgress(prev => {
                const newProgress = prev + 10;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    setIsAdviceAnalyzing(false);
                    return 100;
                }
                return newProgress;
            });
        }, 300);

        setTimeout(() => {
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

            setDiagnosisAdvice(advice);
        }, 2000);
    };

    useEffect(() => {
        if (leftEyeAnalysis && rightEyeAnalysis) {
            const primaryDisease = combinedDiagnosis?.primaryDisease;
            if (primaryDisease) {
                getDiagnosisAdvice(primaryDisease);
            }
        }
    }, [leftEyeAnalysis, rightEyeAnalysis, combinedDiagnosis]);

    const ImageUploadSection = ({ eye, image, onUpload }: {
        eye: 'left' | 'right',
        image: string | null,
        onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void,
    }) => (
        <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{eye === 'left'? '左眼' : '右眼'}眼底影像</h2>
            <div className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                {image? (
                    <img
                        src={image}
                        alt={`${eye === 'left'? '左眼' : '右眼'}影像`}
                        className="max-w-full max-h-full object-contain"
                    />
                ) : (
                    <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <label className="mt-4 cursor-pointer">
                            <span className="mt-2 block text-sm font-semibold text-blue-600">
                                上传{eye === 'left'? '左眼' : '右眼'}图片
                            </span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={onUpload}
                            />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );

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
                        <span>正在分析图像...</span>
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
                    {diagnosis.findings.length > 0 && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg text-yellow-900">检查发现</h3>
                            <ul className="list-disc list-inside text-yellow-800">
                                {diagnosis.findings.map((finding, index) => (
                                    <li key={index}>{finding}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-12">
                    <Activity className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">需要上传两眼图像后才能生成综合诊断</p>
                </div>
            )}
            <button
                onClick={handleResetAll}
                className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center gap-2 hover:bg-blue-100 transition-colors"
            >
                <RefreshCw className="w-4 h-4" />
                <span>重新上传所有图片</span>
            </button>
        </div>
    );

    const DiagnosisAdviceSection = () => (
        <div className="border rounded-lg p-6 bg-white shadow-md mt-8">
            <h2 className="text-xl font-semibold mb-4">辅助诊疗建议</h2>
            {isAdviceAnalyzing ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
                        <span>正在生成诊疗建议...</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${adviceProgress}%` }}
                        ></div>
                    </div>
                </div>
            ) : diagnosisAdvice ? (
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-green-800 whitespace-pre-line">{diagnosisAdvice}</div>
                </div>
            ) : (
                <div className="text-center text-gray-500 py-12">
                    <Activity className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">需要上传两眼图像并生成综合诊断后才能获取诊疗建议</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">单片影像分析</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Side - Image Upload */}
                <ImageUploadSection
                    eye="left"
                    image={leftEyeImage}
                    onUpload={handleImageUpload('left')}
                />

                {/* Right Side - Image Upload */}
                <ImageUploadSection
                    eye="right"
                    image={rightEyeImage}
                    onUpload={handleImageUpload('right')}
                />
            </div>

            {/* Combined Diagnosis Section */}
            <CombinedDiagnosisSection
                diagnosis={combinedDiagnosis}
                isAnalyzing={isAnalyzing}
                progress={progress}
            />

            {/* Diagnosis Advice Section */}
            <DiagnosisAdviceSection />
        </div>
    );
}

export default SingleAnalysis;
