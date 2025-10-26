import React, { useState } from "react";
import { SlNote } from "react-icons/sl";
import { FiSidebar } from "react-icons/fi";

const Sidebar = () => {
  const [isClosed, setIsClosed] = useState(false); // サイドバーの開閉状態

  // サイドバーの開閉を切り替える関数
  const toggleSidebar = () => {
    setIsClosed(!isClosed);
  };

  return (
    <div className={`space-y-5 p-5 h-screen flex flex-col bg-gray-100 transition-all duration-300 ${
      isClosed ? 'w-16' : 'w-64'
    }`}>
      {/* ヘッダー */}
      <div className={`flex items-center align-middle p-3 h-5 ${
        isClosed ? 'justify-center' : 'justify-end mr-5'
      }`}>
        {/* 折りたたみボタン */}
        <button
          onClick={toggleSidebar}
          className="text-gray-600 h-5 flex justify-center align-middle hover:text-gray-800 cursor-pointer transition-colors duration-200"
        >
          <FiSidebar
            className="w-5 h-5"
          />
        </button>
      </div>
      {/* チャットを新規作成 */}
      {!isClosed && (
        <button
          className="flex items-center cursor-pointer w-50 hover:bg-gray-200 rounded p-2 text-sm"
          onClick={() => window.location.reload()}
          type="button"
        >
          <SlNote className="inline-block"/>
          チャットをリセット
        </button>
      )}
    </div>
  )
}

export default Sidebar