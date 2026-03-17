import { sha256 } from "js-sha256";

/**
 * 计算 SHA256 十六进制摘要
 *
 * 优先使用 Web Crypto（安全环境 / 支持 subtle.digest 时），
 * 否则回退到 js-sha256 纯 JS 实现，避免 `crypto.subtle` 为 undefined 报错。
 */
export async function sha256Hex(content: string): Promise<string> {
  try {
    const hasSubtleDigest =
      typeof crypto !== "undefined" &&
      !!crypto.subtle &&
      typeof crypto.subtle.digest === "function";

    if (hasSubtleDigest) {
      const msgBuffer = new TextEncoder().encode(content);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    // 忽略 Web Crypto 异常，使用 JS 回退实现
  }

  // 非安全上下文（HTTP）或浏览器不支持时，使用 js-sha256 回退
  return sha256(content);
}
