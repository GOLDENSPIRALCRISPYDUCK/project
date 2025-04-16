import React, { useState, useEffect } from 'react';
import { Upload, Activity, RefreshCw, Loader2 } from 'lucide-react';
declare const XLSX: any;

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
                const response = await fetch('/store/data1.xlsx');
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
                    advice += `糖尿病视网膜病变诊疗建议：严格控制血糖水平，定期监测糖化血红蛋白；定期进行眼科检查，及时发现并治疗视网膜病变；必要时进行激光治疗或手术治疗。\n`;
                } else if (singleDisease.includes("青光眼")) {
                    advice += `青光眼诊疗建议：定期进行眼压测量和视野检查；遵医嘱使用降眼压药物，如滴眼液或口服药物；必要时进行激光治疗或手术治疗，以控制眼压并保护视神经。\n`;
                } else if (singleDisease.includes("白内障")) {
                    advice += `白内障诊疗建议：定期进行眼科检查，关注晶状体混浊程度；当视力下降到影响日常生活时，可考虑进行白内障手术治疗，如超声乳化手术或囊外摘除术。\n`;
                } else if (singleDisease.includes("AMD")) {
                    advice += `年龄相关性黄斑变性（AMD）诊疗建议：戒烟限酒，保持健康的生活方式；定期进行眼科检查，监测黄斑区变化；在医生指导下使用抗氧化剂、维生素等营养补充剂，或进行激光治疗、光动力疗法等。\n`;
                } else if (singleDisease.includes("高血压")) {
                    advice += `高血压视网膜病变诊疗建议：严格控制血压水平，遵医嘱按时服用降压药物；定期进行眼科检查，关注眼底血管变化；如有眼底出血、渗出等情况，应及时就医治疗。\n`;
                } else if (singleDisease.includes("近视")) {
                    advice += `高度近视视网膜病变诊疗建议：定期进行视力检查，关注近视度数变化；根据近视度数配戴合适的眼镜或隐形眼镜；注意用眼卫生，避免长时间近距离用眼；必要时可考虑进行近视矫正手术。\n`;
                } else if (singleDisease.includes("其他疾病/异常")) {
                    advice += `其他眼部异常诊疗建议：及时就医，进行详细的眼科检查，明确疾病类型和严重程度；根据医生建议进行治疗，如药物治疗、手术治疗等；注意眼部卫生，避免揉眼等不良习惯。\n`;
                } else if (singleDisease.includes("正常")) {
                    advice += `检查结果正常：保持健康用眼习惯，如每用眼40分钟休息5-10分钟，远眺放松；定期进行眼科检查，预防眼部疾病的发生。\n`;
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
