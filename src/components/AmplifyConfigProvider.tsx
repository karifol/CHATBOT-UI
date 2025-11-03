'use client';

import { useEffect } from 'react';
import { Amplify } from 'aws-amplify';

// クライアントサイドでAmplifyを設定するコンポーネント
export const AmplifyConfigProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // ブラウザ環境でのみ実行
    if (typeof window === 'undefined') return;
    
    // 環境変数のチェック
    const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
    const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
    const region = process.env.NEXT_PUBLIC_AWS_REGION;

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

    try {
      Amplify.configure(amplifyConfig);
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