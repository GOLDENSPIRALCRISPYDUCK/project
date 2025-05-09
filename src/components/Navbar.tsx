import React from 'react';
import { Link } from 'react-router-dom';
import {
  Apple,
  Cookie,
  Eye,
  Facebook,
  Flower,
  Leaf,
  Lollipop,
  Rocket,
  Sun, Sword,
  Twitch,
  Twitter,
  X,
  XIcon
} from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">岐黄御瘟</span>
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600">首页</Link>
            <Link to="/preprocessing" className="text-gray-700 hover:text-blue-600">中医流感知识库</Link>
            <Link to="/single-analysis" className="text-gray-700 hover:text-blue-600">预防建议</Link>
            <Link to="/batch-analysis" className="text-gray-700 hover:text-blue-600">流感辅助诊断</Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600">个人中心</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;