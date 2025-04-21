import React, { useEffect, useRef } from 'react';
import { ArrowRight, Brain, Microscope, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    const bgRefs = [useRef(null), useRef(null)];
    const currentBgIndexRef = useRef(0);

    useEffect(() => {
        const images = [
            'https://images.unsplash.com/photo-1580913702955-6c3fcf6ddedc?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&dl=jinyun-kPJvv6HzWR0-unsplash.jpg',
            'https://images.unsplash.com/photo-1611073761742-bce90ccd60ae?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&dl=conscious-design-iSGbjKZ9erg-unsplash.jpg'
        ];

        const changeBackground = () => {
            const currentBgIndex = currentBgIndexRef.current;
            const nextBgIndex = (currentBgIndex + 1) % 2;

            const currentBg = bgRefs[currentBgIndex].current;
            const nextBg = bgRefs[nextBgIndex].current;

            nextBg.style.backgroundImage = `url(${images[(currentBgIndex + 1) % images.length]})`;
            nextBg.classList.add('slide-in');
            currentBg.classList.add('slide-out');

            setTimeout(() => {
                currentBg.style.backgroundImage = `url(${images[(currentBgIndex + 1) % images.length]})`;
                currentBg.classList.remove('slide-out');
                nextBg.classList.remove('slide-in');
                currentBgIndexRef.current = nextBgIndex;
            }, 1000);
        };

        const intervalId = setInterval(changeBackground, 3000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return (
        <div className="flex flex-col relative">
            {/* 背景图片容器 */}
            <div className="h-[600px] absolute inset-0">
                <div
                    ref={bgRefs[0]}
                    className="h-full bg-cover bg-center absolute inset-0"
                    style={{
                        backgroundBlendMode: 'overlay',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }}
                />
                <div
                    ref={bgRefs[1]}
                    className="h-full bg-cover bg-center absolute inset-0"
                    style={{
                        backgroundBlendMode: 'overlay',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }}
                />
            </div>
            {/* 系统名称和按钮部分 */}
            <div className="h-[600px] relative z-10 flex items-center justify-center">
                <div className="text-center text-white">
                    <h1 className="text-7xl font-bold mb-6">岐黄御瘟</h1>
                    <p className="text-3xl mb-8">一种中医流感辅助诊疗Transformer系统</p>
                    <Link
                        to="/preprocessing"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        开始使用 <ArrowRight className="ml-2" />
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">系统特点</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                                <Microscope className="text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">智能预处理</h3>
                            <p className="text-gray-600">自动进行图像增强和优化，提供清晰的诊断基础</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                                <Brain className="text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">AI辅助诊断</h3>
                            <p className="text-gray-600">运用深度学习算法，快速识别潜在的眼科疾病</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                                <Activity className="text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">批量处理</h3>
                            <p className="text-gray-600">支持多张图片同时分析，提高诊断效率</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideOut {
        from { transform: translateX(0); }
        to { transform: translateX(-100%); }
    }

    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }

    .slide-out {
        animation: slideOut 1s ease-in-out;
    }

    .slide-in {
        animation: slideIn 1s ease-in-out;
    }
`;
document.head.appendChild(style);

export default Home;
