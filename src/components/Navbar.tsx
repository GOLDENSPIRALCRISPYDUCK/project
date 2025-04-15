import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">睛准视界</span>
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600">首页</Link>
            <Link to="/preprocessing" className="text-gray-700 hover:text-blue-600">图像预处理</Link>
            <Link to="/single-analysis" className="text-gray-700 hover:text-blue-600">单片分析</Link>
            <Link to="/batch-analysis" className="text-gray-700 hover:text-blue-600">批量分析</Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600">智能诊断</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
