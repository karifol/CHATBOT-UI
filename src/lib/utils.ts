import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getChatHistory } from "./chatApi"

// Tailwind CSSのクラス名を結合するユーティリティ関数
// ShadeUIで使われている
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 新しいセッションIDをランダムに生成する（基本版）
 * @returns 新しいセッションID
 */
function generateBaseSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  return `${timestamp}-${randomPart}`;
}

/**
 * 既存のセッションIDと重複しない新しいセッションIDを生成する
 * @param uid ユーザーID
 * @returns 新しいセッションID
 */
export async function generateUniqueSessionId(uid: string): Promise<string> {
  try {
    // 既存のセッション履歴を取得
    const existingSessions = await getChatHistory(uid);
    const existingSessionIds = new Set(existingSessions.map(session => session.session_id));
    
    let newSessionId: string;
    let attempts = 0;
    const maxAttempts = 10; // 無限ループを防ぐため最大試行回数を設定
    
    // 重複しないセッションIDが生成されるまでループ
    do {
      newSessionId = generateBaseSessionId();
      attempts++;
      
      if (attempts > maxAttempts) {
        // 万が一の場合は、より複雑なIDを生成
        const extraRandom = Math.random().toString(36).substr(2, 5);
        newSessionId = `${newSessionId}-${extraRandom}`;
        break;
      }
    } while (existingSessionIds.has(newSessionId));
    
    return newSessionId;
  } catch (error) {
    console.error("セッション履歴の取得に失敗しました。基本的なセッションIDを生成します:", error);
    // エラーが発生した場合は基本的なセッションIDを返す
    return generateBaseSessionId();
  }
}

/**
 * 新しいセッションIDをランダムに生成する（後方互換性のため残す）
 * @returns 新しいセッションID
 * @deprecated generateUniqueSessionId を使用してください
 */
export function generateSessionId(): string {
  return generateBaseSessionId();
}