// アプリケーション全体で使用する定数
export const APP_CONFIG = {
  TITLE: "TEST ChatBot", // アプリケーションのタイトル
  CHAT_API_ENDPOINT: "", // チャットAPIのエンドポイント
} as const;

// 個別にエクスポートも提供
export const APP_TITLE = APP_CONFIG.TITLE;
export const CHAT_API_ENDPOINT = APP_CONFIG.CHAT_API_ENDPOINT;