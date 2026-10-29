const config = require('../config/env');

class AIModerationService {
  /**
   * Phân tích nội dung khiếu nại bằng LLM API (Google Gemini hoặc OpenAI)
   * Kèm cơ chế phòng thủ Fallback Heuristic tự động nếu chưa có API Key hoặc mạng lỗi.
   */
  static async analyzeDispute({
    reason,
    description,
    evidenceUrl = null,
    bookingId = null,
    targetType = 'property',
  }) {
    const rawContent = `${reason} ${description}`.trim();

    // 1. Nếu có GEMINI_API_KEY -> Gọi Google Gemini LLM API
    if (config.GEMINI_API_KEY) {
      try {
        const geminiResult = await this.callGeminiAPI({
          reason,
          description,
          evidenceUrl,
          bookingId,
          targetType,
        });
        if (geminiResult) return geminiResult;
      } catch (err) {
        console.warn('[AI Moderation - Gemini API Notice]:', err.message);
      }
    }

    // 2. Nếu có OPENAI_API_KEY -> Gọi OpenAI GPT-4o-mini API
    if (config.OPENAI_API_KEY) {
      try {
        const openaiResult = await this.callOpenAIAPI({
          reason,
          description,
          evidenceUrl,
          bookingId,
          targetType,
        });
        if (openaiResult) return openaiResult;
      } catch (err) {
        console.warn('[AI Moderation - OpenAI API Notice]:', err.message);
      }
    }

    // 3. Fallback Heuristic NLP Engine (Nội bộ hệ thống không cần API bên thứ ba)
    return this.fallbackHeuristicEngine({
      reason,
      description,
      evidenceUrl,
      bookingId,
    });
  }

  /**
   * Gọi Google Gemini LLM API (Gemini 1.5 Flash / 2.0 Flash)
   */
  static async callGeminiAPI({ reason, description, evidenceUrl, bookingId, targetType }) {
    const apiKey = config.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const promptText = `
Bạn là AI kiểm duyệt nội dung và hỗ trợ khách hàng của nền tảng Homestay.
Hãy phân tích tố cáo sau đây và đưa ra quyết định kiểm duyệt tự động:
- Mục tiêu: ${targetType}
- Mã đơn đặt phòng: ${bookingId || 'Không có'}
- Lý do khiếu nại: ${reason}
- Mô tả sự cố: ${description}
- Có bằng chứng ảnh không: ${evidenceUrl ? 'Có (' + evidenceUrl + ')' : 'Không có'}

TIÊU CHÍ:
1. SPAM / QUẢNG CÁO RÁC (decision: "rejected"): Nếu nội dung chứa quảng cáo vay tiền, telegram, cờ bạc, lừa đảo, rủ rê mua bán hoặc vô nghĩa < 6 ký tự.
2. HỢP LỆ & ĐƯỢC DUYỆT TỰ ĐỘNG (decision: "resolved"): Nếu phàn nàn sự cố thực tế (phòng bẩn, hôi, sai phòng, hỏng điều hòa, lừa dối...) VÀ có mã đơn phòng hoặc bằng chứng ảnh.
3. CẦN ADMIN ĐIỀU TRA (decision: "pending"): Các tranh chấp phức tạp khác.

TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON (KHÔNG bọc trong markdown code fence, không viết chữ gì khác ngoài JSON):
{
  "decision": "rejected" | "resolved" | "pending",
  "isSpam": true | false,
  "confidence": 0.95,
  "category": "spam" | "cleanliness" | "amenity" | "service" | "fraud" | "other",
  "aiNote": "Tóm tắt 1 câu ngắn gọn lý do đưa ra quyết định bằng tiếng Việt"
}
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 250,
          },
        }),
      });

      clearTimeout(timeout);
      if (!response.ok) {
        throw new Error(`Gemini HTTP Error ${response.status}`);
      }

      const json = await response.json();
      const rawOutput = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = this.parseCleanJson(rawOutput);

      if (parsed && parsed.decision) {
        return {
          provider: 'google_gemini',
          decision: parsed.decision,
          isSpam: Boolean(parsed.isSpam),
          confidence: parsed.confidence || 0.9,
          category: parsed.category || 'other',
          aiNote: `[Google Gemini AI]: ${parsed.aiNote || 'Đã phân tích và phân loại tự động bởi Gemini.'}`,
        };
      }
    } finally {
      clearTimeout(timeout);
    }

    return null;
  }

  /**
   * Gọi OpenAI Chat Completions API (gpt-4o-mini)
   */
  static async callOpenAIAPI({ reason, description, evidenceUrl, bookingId, targetType }) {
    const apiKey = config.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content: 'Bạn là Trust & Safety AI cho nền tảng đặt phòng Homestay. Phân tích khiếu nại và trả về JSON thuần { decision: "rejected"|"resolved"|"pending", isSpam: boolean, confidence: number, aiNote: string }',
            },
            {
              role: 'user',
              content: `Mục tiêu: ${targetType}, Đơn: ${bookingId || 'none'}, Lý do: ${reason}, Mô tả: ${description}, Ảnh: ${evidenceUrl ? 'có' : 'không'}`,
            },
          ],
        }),
      });

      clearTimeout(timeout);
      if (!response.ok) {
        throw new Error(`OpenAI HTTP Error ${response.status}`);
      }

      const json = await response.json();
      const rawOutput = json.choices?.[0]?.message?.content || '';
      const parsed = this.parseCleanJson(rawOutput);

      if (parsed && parsed.decision) {
        return {
          provider: 'openai_gpt4o_mini',
          decision: parsed.decision,
          isSpam: Boolean(parsed.isSpam),
          confidence: parsed.confidence || 0.9,
          category: parsed.category || 'other',
          aiNote: `[OpenAI GPT-4o-mini]: ${parsed.aiNote || 'Đã phân tích tự động bởi GPT-4o-mini.'}`,
        };
      }
    } finally {
      clearTimeout(timeout);
    }

    return null;
  }

  /**
   * Heuristic Engine: Xử lý dự phòng (Fallback) khi không có API Key hoặc mất kết nối
   */
  static fallbackHeuristicEngine({ reason, description, evidenceUrl, bookingId }) {
    const rawContent = `${reason} ${description}`.toLowerCase();
    const normContent = rawContent
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');

    const spamKeywords = [
      'quang cao', 'quảng cáo', 'mua ban', 'mua bán', 'telegram', 'zalo',
      'lua dao', 'lừa đảo', 'hack', 'vay tien', 'vay tiền', 'tuyen dung',
      'tuyển dụng', 'keo telegram', 'spam', 'cờ bạc', 'co bac'
    ];
    const isSpam =
      spamKeywords.some((kw) => rawContent.includes(kw) || normContent.includes(kw)) ||
      description.trim().length < 6;

    const legitIssueKeywords = [
      'sai phong', 'sai phòng', 'ban', 'bẩn', 'khong co nuoc', 'không có nước',
      'khong lien lac duoc', 'không liên lạc được', 'chay no', 'cháy nổ',
      'hong dieu hoa', 'hỏng điều hòa', 'mui hoi', 'mùi hôi', 'thai do kem',
      'thái độ kém', 'hong', 'hỏng', 'on ao', 'ồn ào', 'bẩn thỉu', 'ban thiu'
    ];
    const hasLegitIssue =
      legitIssueKeywords.some((kw) => rawContent.includes(kw) || normContent.includes(kw));
    const hasEvidence = Boolean(evidenceUrl);

    if (isSpam) {
      return {
        provider: 'local_heuristic_ai',
        decision: 'rejected',
        isSpam: true,
        confidence: 0.98,
        category: 'spam',
        aiNote: '[AI Auto-Shield]: Phát hiện nội dung spam hoặc từ khóa vi phạm tiêu chuẩn cộng đồng. Tự động từ chối.',
      };
    }

    if (hasEvidence && hasLegitIssue && bookingId) {
      return {
        provider: 'local_heuristic_ai',
        decision: 'resolved',
        isSpam: false,
        confidence: 0.92,
        category: 'cleanliness_or_service',
        aiNote: '[AI Auto-Accept]: Khiếu nại có mã phòng hợp lệ, mô tả sự cố rõ ràng và có bằng chứng đính kèm. AI đã tự động chấp thuận.',
      };
    }

    return {
      provider: 'local_heuristic_ai',
      decision: 'pending',
      isSpam: false,
      confidence: 0.65,
      category: 'general_dispute',
      aiNote: '[AI Triage]: Khiếu nại cần quản trị viên tiếp nhận và điều tra thủ công.',
    };
  }

  /**
   * Bóc tách JSON an toàn từ phản hồi của LLM (kể cả khi bị bọc trong markdown ```json ... ```)
   */
  static parseCleanJson(text) {
    if (!text || typeof text !== 'string') return null;
    try {
      const cleaned = text
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleaned);
    } catch (_) {
      // Thử regex tìm JSON object
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (_) {}
      }
      return null;
    }
  }
}

module.exports = AIModerationService;
