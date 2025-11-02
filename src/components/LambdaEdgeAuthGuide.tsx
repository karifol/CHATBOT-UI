'use client';

import React from 'react';

export const LambdaEdgeAuthGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">
          🌐 Lambda@Edge認証とReactアプリの統合
        </h2>
        
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-2 text-blue-700">📋 概要</h3>
            <p className="text-gray-700">
              このアプリケーションはLambda@Edgeで認証されたユーザー情報を自動的に検出し、
              Reactアプリ内でログイン状態を維持します。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2 text-blue-700">🔧 技術的な仕組み</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Lambda@Edgeがリクエストを処理し、認証済みの場合はCognitoトークンをCookieに設定</li>
              <li>Reactアプリ起動時にCookieからトークンを自動取得</li>
              <li>取得したトークンをAmplifyのローカルストレージに保存</li>
              <li>Amplify Authライブラリでユーザー情報を取得・管理</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2 text-blue-700">✅ 設定確認項目</h3>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium mb-2">Lambda@Edge設定</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• User Pool ID: ap-northeast-1_zmRWDqupw</li>
                <li>• Client ID: 4hevv56m24aut5499jrcgufto0</li>
                <li>• Region: ap-northeast-1</li>
                <li>• Domain: ap-northeast-1zmrwdqupw.auth.ap-northeast-1.amazoncognito.com</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded border mt-2">
              <h4 className="font-medium mb-2">React アプリ環境変数</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• NEXT_PUBLIC_USER_POOL_ID=ap-northeast-1_zmRWDqupw</li>
                <li>• NEXT_PUBLIC_USER_POOL_CLIENT_ID=4hevv56m24aut5499jrcgufto0</li>
                <li>• NEXT_PUBLIC_AWS_REGION=ap-northeast-1</li>
                <li>• NEXT_PUBLIC_USER_POOL_DOMAIN=ap-northeast-1zmrwdqupw.auth.ap-northeast-1.amazoncognito.com</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2 text-blue-700">🚀 使用方法</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>ユーザーがアプリケーションにアクセス</li>
              <li>Lambda@Edgeが認証状態を確認</li>
              <li>未認証の場合、Cognito User Pool の認証画面にリダイレクト</li>
              <li>認証成功後、Lambda@Edgeがトークンをcookieに設定してReactアプリにリダイレクト</li>
              <li>Reactアプリが起動時にCookieからトークンを読み取り、ユーザー情報を取得</li>
            </ol>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2 text-blue-700">🔍 デバッグ方法</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>開発環境では右上の「🔧 Debug」ボタンをクリックしてデバッグパネルを開く</li>
              <li>「詳細診断実行」でAmplify認証の詳細情報を確認</li>
              <li>「Cookieチェック」でLambda@Edgeが設定したCookieを確認</li>
              <li>「LocalStorageチェック」でAmplifyが保存したトークンを確認</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2 text-red-700">⚠️ トラブルシューティング</h3>
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 p-3 rounded">
                <h4 className="font-medium text-red-800 mb-1">認証情報が取得できない場合</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Lambda@EdgeとReactアプリの設定値が一致しているか確認</li>
                  <li>• Cookieのドメインとパスが正しく設定されているか確認</li>
                  <li>• ブラウザの開発者ツールでCookieが正しく設定されているか確認</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 p-3 rounded">
                <h4 className="font-medium text-orange-800 mb-1">トークンの有効期限切れ</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• ページを再読み込みしてLambda@Edgeで再認証を実行</li>
                  <li>• 必要に応じてログアウトして再ログイン</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LambdaEdgeAuthGuide;