import { getCurrentUser, fetchAuthSession, signIn, signOut, signUp, confirmSignUp, resendSignUpCode } from '@aws-amplify/auth';
import { AuthUser } from '@aws-amplify/auth';

// ログイン中のユーザー情報を取得する型定義
export interface CurrentUser {
  username: string;
  email?: string;
  sub: string; // Cognito User ID
  attributes?: Record<string, unknown>;
}

/**
 * 現在ログイン中のユーザーを取得する関数
 * @returns Promise<CurrentUser | null> ログイン中のユーザー情報、未ログインの場合はnull
 */
export const getCurrentAuthUser = async (): Promise<CurrentUser | null> => {
  try {
    console.log('🔍 getCurrentUser() を実行中...');
    const user: AuthUser = await getCurrentUser();
    console.log('✅ getCurrentUser() 成功:', user);
    
    // ユーザー情報を整形して返す
    const currentUser = {
      username: user.username,
      sub: user.userId,
      email: user.signInDetails?.loginId || '',
      attributes: user.signInDetails ? { ...user.signInDetails } as Record<string, unknown> : {}
    };
    
    console.log('📋 整形されたユーザー情報:', currentUser);
    return currentUser;
  } catch (error) {
    console.log('❌ ユーザーが認証されていません:', error);
    return null;
  }
};

/**
 * 認証セッションを確認してユーザーがログイン中かどうかを判定
 * @returns Promise<boolean> ログイン中の場合true、そうでなければfalse
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    console.log('🔍 fetchAuthSession() を実行中...');
    const session = await fetchAuthSession();
    console.log('📋 完全なセッション情報:', session);
    console.log('📋 セッション情報:', {
      hasTokens: !!session.tokens,
      hasAccessToken: !!session.tokens?.accessToken,
      hasIdToken: !!session.tokens?.idToken,
      credentials: !!session.credentials,
      identityId: session.identityId
    });
    
    // より詳細なチェックを実行
    if (session.tokens?.accessToken) {
      console.log('✅ アクセストークンあり');
      try {
        // getCurrentUser でも確認
        await getCurrentUser();
        console.log('✅ getCurrentUser() も成功');
        return true;
      } catch (userError) {
        console.log('⚠️ セッションはあるがgetCurrentUser()失敗:', userError);
        return false;
      }
    } else {
      console.log('❌ アクセストークンなし');
      return false;
    }
  } catch (error) {
    console.log('❌ 認証セッションの取得に失敗:', error);
    return false;
  }
};

/**
 * ユーザーのアクセストークンを取得
 * @returns Promise<string | null> アクセストークン、取得できない場合はnull
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString() || null;
  } catch (error) {
    console.log('アクセストークンの取得に失敗:', error);
    return null;
  }
};

/**
 * ユーザーのIDトークンを取得（ユーザー属性情報が含まれる）
 * @returns Promise<string | null> IDトークン、取得できない場合はnull
 */
export const getIdToken = async (): Promise<string | null> => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || null;
  } catch (error) {
    console.log('❌ IDトークンの取得に失敗:', error);
    return null;
  }
};

// ログイン関数の型定義
export interface LoginParams {
  username: string;
  password: string;
}

export interface SignUpParams {
  username: string;
  password: string;
  email: string;
}

export interface ConfirmSignUpParams {
  username: string;
  confirmationCode: string;
}

/**
 * ユーザーログイン
 */
export const loginUser = async ({ username, password }: LoginParams) => {
  try {
    console.log('� ログイン試行中...', username);
    const { isSignedIn, nextStep } = await signIn({ username, password });
    
    console.log('📋 ログイン結果:', { isSignedIn, nextStep });
    
    if (isSignedIn) {
      console.log('✅ ログイン成功');
      return { success: true, user: await getCurrentUser() };
    } else {
      console.log('⚠️ 追加のステップが必要:', nextStep);
      return { success: false, nextStep, message: '追加の認証ステップが必要です' };
    }
  } catch (error: unknown) {
    console.error('❌ ログインエラー:', error);
    const err = error as Error;
    return { 
      success: false, 
      error: err.name || 'LoginError',
      message: err.message || 'ログインに失敗しました'
    };
  }
};

/**
 * ユーザーログアウト
 */
export const logoutUser = async () => {
  try {
    console.log('👋 ログアウト中...');
    await signOut();
    console.log('✅ ログアウト成功');
    return { success: true };
  } catch (error: unknown) {
    console.error('❌ ログアウトエラー:', error);
    const err = error as Error;
    return { 
      success: false, 
      error: err.name || 'LogoutError',
      message: err.message || 'ログアウトに失敗しました'
    };
  }
};

/**
 * ユーザー登録
 */
export const registerUser = async ({ username, password, email }: SignUpParams) => {
  try {
    console.log('� ユーザー登録中...', { username, email });
    const { isSignUpComplete, nextStep } = await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email
        }
      }
    });
    
    console.log('📋 登録結果:', { isSignUpComplete, nextStep });
    
    return { 
      success: true, 
      isComplete: isSignUpComplete, 
      nextStep,
      message: isSignUpComplete ? '登録完了' : '確認コードを送信しました'
    };
  } catch (error: unknown) {
    console.error('❌ 登録エラー:', error);
    const err = error as Error;
    return { 
      success: false, 
      error: err.name || 'SignUpError',
      message: err.message || 'ユーザー登録に失敗しました'
    };
  }
};

/**
 * ユーザー登録の確認
 */
export const confirmUserRegistration = async ({ username, confirmationCode }: ConfirmSignUpParams) => {
  try {
    console.log('✅ 登録確認中...', username);
    const { isSignUpComplete, nextStep } = await confirmSignUp({
      username,
      confirmationCode
    });
    
    console.log('📋 確認結果:', { isSignUpComplete, nextStep });
    
    return { 
      success: true, 
      isComplete: isSignUpComplete,
      nextStep,
      message: isSignUpComplete ? 'アカウントが確認されました' : '追加のステップが必要です'
    };
  } catch (error: unknown) {
    console.error('❌ 確認エラー:', error);
    const err = error as Error;
    return { 
      success: false, 
      error: err.name || 'ConfirmSignUpError',
      message: err.message || 'アカウント確認に失敗しました'
    };
  }
};

/**
 * 確認コードの再送信
 */
export const resendConfirmationCode = async (username: string) => {
  try {
    console.log('📤 確認コード再送信中...', username);
    await resendSignUpCode({ username });
    console.log('✅ 確認コード再送信成功');
    
    return { 
      success: true,
      message: '確認コードを再送信しました'
    };
  } catch (error: unknown) {
    console.error('❌ 確認コード再送信エラー:', error);
    const err = error as Error;
    return { 
      success: false, 
      error: err.name || 'ResendCodeError',
      message: err.message || '確認コードの再送信に失敗しました'
    };
  }
};



/**
 * 認証の詳細診断を実行
 */
export const runAuthDiagnostics = async () => {
  console.log('🔬 === 認証診断開始 ===');
  
  try {
    // 1. 環境変数チェック
    console.log('1️⃣ 環境変数チェック:');
    console.log('  - User Pool ID:', process.env.NEXT_PUBLIC_USER_POOL_ID);
    console.log('  - Client ID:', process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID);
    console.log('  - Region:', process.env.NEXT_PUBLIC_AWS_REGION);
    
    // 2. セッション詳細チェック
    console.log('2️⃣ セッション詳細チェック:');
    const session = await fetchAuthSession();
    console.log('  - Session object keys:', Object.keys(session));
    console.log('  - Tokens:', session.tokens);
    console.log('  - Credentials:', session.credentials);
    console.log('  - Identity ID:', session.identityId);
    
    // 3. getCurrentUser チェック
    console.log('3️⃣ getCurrentUser チェック:');
    try {
      const user = await getCurrentUser();
      console.log('  - User object:', user);
      console.log('  - Username:', user.username);
      console.log('  - User ID:', user.userId);
      console.log('  - Sign-in details:', user.signInDetails);
    } catch (userError) {
      console.log('  - getCurrentUser エラー:', userError);
    }
    
    // 4. LocalStorage/SessionStorage チェック
    console.log('4️⃣ ストレージチェック:');
    const allKeys = Object.keys(localStorage);
    const cognitoKeys = allKeys.filter(key => key.includes('amplify') || key.includes('cognito') || key.includes('aws'));
    console.log('  - Cognito関連キー:', cognitoKeys);
    
  } catch (error) {
    console.log('❌ 診断エラー:', error);
  }
  
  console.log('🔬 === 認証診断終了 ===');
};