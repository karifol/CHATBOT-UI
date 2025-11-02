'use client';

import { useEffect } from 'react';
import { Amplify } from 'aws-amplify';

// クライアントサイドでAmplifyを設定するコンポーネント
export const AmplifyConfigProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // ブラウザ環境でのみ実行
    if (typeof window === 'undefined') return;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 クライアントサイドでAmplify設定を開始...');
    }
    
    // 環境変数のチェック
    const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
    const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
    const region = process.env.NEXT_PUBLIC_AWS_REGION;

    if (process.env.NODE_ENV === 'development') {
      console.log('📋 設定値チェック:', {
        userPoolId: userPoolId || '❌ 未設定',
        userPoolClientId: userPoolClientId || '❌ 未設定', 
        region: region || 'ap-northeast-1（デフォルト）'
      });
    }

    if (!userPoolId || !userPoolClientId) {
      console.error('❌ 必要な環境変数が設定されていません');
      console.error('必要な環境変数:');
      console.error('- NEXT_PUBLIC_USER_POOL_ID:', userPoolId);
      console.error('- NEXT_PUBLIC_USER_POOL_CLIENT_ID:', userPoolClientId);
      console.error('- NEXT_PUBLIC_AWS_REGION:', region);
      return;
    }

    const amplifyConfig = {
      Auth: {
        Cognito: {
          userPoolId: userPoolId,
          userPoolClientId: userPoolClientId,
          region: region || 'ap-northeast-1',
          loginWith: {
            email: true,
            username: true
          }
        }
      }
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('⚙️ Amplify設定:', amplifyConfig);
    }

    try {
      Amplify.configure(amplifyConfig);
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Amplify設定完了');
        
        // 設定が正しく適用されたかの確認
        console.log('✅ Cognito Auth設定が正常に適用されました');
        console.log('  - User Pool ID:', userPoolId);
        console.log('  - Client ID:', userPoolClientId);
        console.log('  - Region:', region);
      }
    } catch (error) {
      console.error('❌ Amplify設定エラー:', error);
      // エラーの詳細を表示
      if (error instanceof Error) {
        console.error('エラー詳細:', error.message);
        console.error('スタックトレース:', error.stack);
      }
    }
  }, []);

  return <>{children}</>;
};

export default AmplifyConfigProvider;