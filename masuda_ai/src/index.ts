import { STYLE_REWRITE_EXAMPLES } from "./masudaCorpus";

export interface Env {
  AI: {
    run: (model: string, input: unknown) => Promise<unknown>;
  };
  DRAFT_MODEL?: string;
  STYLE_MODEL?: string;
  ALLOWED_ORIGIN?: string;
}

type ChatRole = "system" | "user" | "assistant";

type HistoryMessage = {
  role: Exclude<ChatRole, "system">;
  content: string;
};

type ReplyRequest = {
  message?: string;
  history?: HistoryMessage[];
  maxTokens?: number;
  temperature?: number;
  style_strength?: "weak" | "normal" | "strong";
};

type StyleReplyRequest = {
  message?: string;
  history?: HistoryMessage[];
  draft_reply?: string;
  maxTokens?: number;
  temperature?: number;
  style_strength?: "weak" | "normal" | "strong";
};

type JsonRecord = Record<string, unknown>;

const DEFAULT_DRAFT_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const DEFAULT_STYLE_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const MAX_HISTORY_ITEMS = 12;
const DEFAULT_MAX_TOKENS = 140;
const DEFAULT_TEMPERATURE = 0.7;
const STYLE_EXAMPLE_LIMIT = 2;

const DRAFT_SYSTEM_PROMPT = `
会話履歴と最新メッセージを見て、自然な返答を日本語で1〜3文で返してください。
普通の会話として自然であれば十分です。キャラ作りは不要です。
返答本文だけを書いてください。
`.trim();

const STYLE_SYSTEM_PROMPT = `
あなたは「増田AI美」です。
渡された元の返答の意味を保ったまま、増田っぽい自然な雑談口調の日本語に言い換えてください。

条件:
- 1〜3文
- やわらかい
- 距離が近い
- 少しくだけた感じ
- 「笑」「ええ」「いいなぁ」などを自然に使う
- 元の返答の意味は変えない
- 情報を減らしすぎない
- 情報を勝手に足さない
- 元の返答が短いときは、少し口調を寄せるだけでよい
- 参考例の内容を混ぜない
- 参考例は口調だけ参考にする
- 新しく返答を考え直さない
- 必ず元の返答だけを言い換える
- 会話を先に進めない
- 元の返答にない単語や話題を足さない
- 元の返答の主語・時制・話題を変えない
- 説明や補足は書かない
- 返答本文だけを書く
`.trim();

const STYLE_STRENGTH_PROMPTS = {
  weak: `
- 増田っぽさは弱めでよい
- 意味保持を最優先する
- 元の表現を少しやわらかくする程度に留める
- 語尾や絵文字は無理に足さない
- 元文をそのまま使えるなら、ほぼそのままでよい
`.trim(),
  normal: `
- 増田っぽさは自然な範囲で入れる
- 意味保持を優先しつつ、少し親しみある言い方にする
- 語尾を少し砕いてよい
- 必要なら「笑」を1つまで自然に足してよい
- 返答が短いときは、少しだけ距離感を近くしてよい
- 元文の丁寧さを少しだけ崩して、やわらかくしてよい
`.trim(),
  strong: `
- 増田っぽさをやや強めに出してよい
- ただし意味は変えない
- 語尾や距離感、軽いツッコミを自然に足してよい
- 必要なら「笑」「ええ」「いいなぁ」「〜？」などを自然に使ってよい
- 短すぎる返答には少しだけ親しみを足してよい
- 絵文字は多用せず、自然なら1つまで使ってよい
`.trim(),
} as const;

const STYLE_REWRITE_EXAMPLES_BY_STRENGTH = {
  weak: STYLE_REWRITE_EXAMPLES.slice(0, 2),
  normal: [
    ...STYLE_REWRITE_EXAMPLES.slice(0, 4),
    {
      source: "もちろん、しりとりしよう！ まずはりんごからどう？",
      target: "もちろん、しりとりしよー！ まずはりんごからどう？笑",
    },
  ],
  strong: [
    ...STYLE_REWRITE_EXAMPLES.slice(0, 4),
    {
      source: "もちろん、しりとりしよう！ まずはりんごからどう？",
      target: "ええ、しりとりしよー！ まずはりんごからどう？😳",
    },
    {
      source: "今度会える日ある？",
      target: "今度いつ会えるー？笑",
    },
  ],
} as const;

function buildCorsHeaders(env: Env): HeadersInit {
  return {
    "access-control-allow-origin": env.ALLOWED_ORIGIN ?? "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}

function json(body: JsonRecord, status: number, env: Env): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...buildCorsHeaders(env),
    },
  });
}

function isHistoryMessage(value: unknown): value is HistoryMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Record<string, unknown>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

function normalizeHistory(history: unknown): HistoryMessage[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(isHistoryMessage)
    .slice(-MAX_HISTORY_ITEMS)
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));
}

function normalizeNumber(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

function extractText(result: unknown): string | null {
  if (!result || typeof result !== "object") {
    return null;
  }

  const record = result as Record<string, unknown>;

  if (typeof record.output_text === "string" && record.output_text.trim().length > 0) {
    return record.output_text.trim();
  }

  if (typeof record.response === "string" && record.response.trim().length > 0) {
    return record.response.trim();
  }

  if (typeof record.result === "object" && record.result !== null) {
    const nested = record.result as Record<string, unknown>;
    if (typeof nested.response === "string" && nested.response.trim().length > 0) {
      return nested.response.trim();
    }
  }

  if (Array.isArray(record.choices) && record.choices.length > 0) {
    const firstChoice = record.choices[0];
    if (firstChoice && typeof firstChoice === "object") {
      const choiceRecord = firstChoice as Record<string, unknown>;
      const message = choiceRecord.message;

      if (message && typeof message === "object") {
        const messageRecord = message as Record<string, unknown>;
        if (typeof messageRecord.content === "string" && messageRecord.content.trim().length > 0) {
          return messageRecord.content.trim();
        }
      }

      if (typeof choiceRecord.text === "string" && choiceRecord.text.trim().length > 0) {
        return choiceRecord.text.trim();
      }
    }
  }

  if (Array.isArray(record.output)) {
    for (const item of record.output) {
      if (!item || typeof item !== "object") continue;
      const outputRecord = item as Record<string, unknown>;

      if (typeof outputRecord.content === "string" && outputRecord.content.trim().length > 0) {
        return outputRecord.content.trim();
      }

      if (Array.isArray(outputRecord.content)) {
        for (const contentItem of outputRecord.content) {
          if (!contentItem || typeof contentItem !== "object") continue;
          const contentRecord = contentItem as Record<string, unknown>;
          if (typeof contentRecord.text === "string" && contentRecord.text.trim().length > 0) {
            return contentRecord.text.trim();
          }
        }
      }
    }
  }

  return null;
}

function buildRawPreview(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") {
    return raw;
  }

  const record = raw as Record<string, unknown>;

  return {
    response: record.response ?? null,
    result: record.result ?? null,
    choices: Array.isArray(record.choices) ? record.choices.slice(0, 1) : null,
    output_text: record.output_text ?? null,
    output: record.output ?? null,
    usage: record.usage ?? null,
  };
}

function buildDraftMessages(message: string, history: HistoryMessage[]): Array<{ role: ChatRole; content: string }> {
  return [
    { role: "system", content: DRAFT_SYSTEM_PROMPT },
    ...history.slice(-6),
    { role: "user", content: message },
  ];
}

function buildStyleMessages(
  _message: string,
  _history: HistoryMessage[],
  draftReply: string,
  styleStrength: "weak" | "normal" | "strong",
): Array<{ role: ChatRole; content: string }> {
  const loweredDraftReply = draftReply.toLowerCase();
  const examples = STYLE_REWRITE_EXAMPLES_BY_STRENGTH[styleStrength]
    .map((example) => {
      const source = example.source.toLowerCase();
      let score = 0;

      for (const word of draftReply.split(/[\s、。！!？?\n]+/).filter(Boolean)) {
        if (source.includes(word.toLowerCase())) score += 2;
      }

      if (loweredDraftReply.includes("旅行") && source.includes("旅行")) score += 4;
      if (loweredDraftReply.includes("しりとり") && source.includes("しりとり")) score += 4;
      if (loweredDraftReply.includes("残業") && source.includes("大変")) score += 3;
      if (loweredDraftReply.includes("飲") && source.includes("会える")) score += 3;
      if (loweredDraftReply.includes("いつ") && source.includes("いつ")) score += 2;

      return { example, score };
    })
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.example)
    .slice(0, STYLE_EXAMPLE_LIMIT)
    .map((example) => `元: ${example.source}\n変換: ${example.target}`)
    .join("\n\n");

  return [
    { role: "system", content: `${STYLE_SYSTEM_PROMPT}\n\n追加方針:\n${STYLE_STRENGTH_PROMPTS[styleStrength]}` },
    {
      role: "user",
      content: [
        `元の返答だけを自然に言い換えてください。`,
        `元の返答:`,
        draftReply,
        ``,
        `リライト例:`,
        examples,
        ``,
        `注意: 元の返答の意味を保ったまま、口調だけ変えること。新しい返答を作らないこと。`,
      ].join("\n"),
    },
  ];
}

async function runModel(
  env: Env,
  model: string,
  messages: Array<{ role: ChatRole; content: string }>,
  maxTokens: number,
  temperature: number,
): Promise<{ text: string | null; raw: unknown }> {
  const result = await env.AI.run(model, {
    messages,
    max_tokens: maxTokens,
    temperature,
    chat_template_kwargs: {
      enable_thinking: false,
    },
  });

  return {
    text: extractText(result),
    raw: result,
  };
}

async function handleDraftReply(
  payload: ReplyRequest,
  env: Env,
): Promise<{ draftReply: string | null; response: Response | null }> {
  const message = payload.message?.trim();
  if (!message) {
    return {
      draftReply: null,
      response: json({ error: "`message` is required" }, 400, env),
    };
  }

  const history = normalizeHistory(payload.history);
  const maxTokens = normalizeNumber(payload.maxTokens, DEFAULT_MAX_TOKENS, 48, 240);
  const draftModel = env.DRAFT_MODEL ?? DEFAULT_DRAFT_MODEL;

  try {
    const draftResult = await runModel(
      env,
      draftModel,
      buildDraftMessages(message, history),
      Math.max(96, maxTokens),
      0.45,
    );
    const draftReply = draftResult.text?.trim() ?? null;

    if (!draftReply) {
      return {
        draftReply: null,
        response: json(
          {
            error: "Workers AI returned an invalid draft response",
            step: "draft",
            raw_preview: buildRawPreview(draftResult.raw),
            mode: "ai_error",
          },
          502,
          env,
        ),
      };
    }

    return { draftReply, response: null };
  } catch (error) {
    return {
      draftReply: null,
      response: json(
        {
          error: "Workers AI request failed",
          detail: error instanceof Error ? error.message : "Unknown error",
          step: "draft",
          mode: "ai_error",
        },
        502,
        env,
      ),
    };
  }
}

async function handleStyleReply(
  payload: StyleReplyRequest,
  env: Env,
): Promise<{ reply: string | null; response: Response | null }> {
  const message = payload.message?.trim();
  const draftReply = payload.draft_reply?.trim();

  if (!message) {
    return {
      reply: null,
      response: json({ error: "`message` is required" }, 400, env),
    };
  }

  if (!draftReply) {
    return {
      reply: null,
      response: json({ error: "`draft_reply` is required" }, 400, env),
    };
  }

  const history = normalizeHistory(payload.history);
  const maxTokens = normalizeNumber(payload.maxTokens, DEFAULT_MAX_TOKENS, 48, 240);
  const temperature = normalizeNumber(payload.temperature, DEFAULT_TEMPERATURE, 0, 1.2);
  const styleStrength = payload.style_strength ?? "normal";
  const styleModel = env.STYLE_MODEL ?? DEFAULT_STYLE_MODEL;

  try {
    const styleResult = await runModel(
      env,
      styleModel,
      buildStyleMessages(message, history, draftReply, styleStrength),
      maxTokens,
      styleStrength === "weak" ? Math.min(temperature, 0.45) : styleStrength === "strong" ? Math.max(temperature, 0.85) : temperature,
    );
    const reply = styleResult.text?.trim() ?? null;

    if (!reply) {
      return {
        reply: null,
        response: json(
          {
            error: "Workers AI returned an invalid style response",
            step: "style",
            draft_reply: draftReply,
            raw_preview: buildRawPreview(styleResult.raw),
            mode: "ai_error",
          },
          502,
          env,
        ),
      };
    }

    return { reply, response: null };
  } catch (error) {
    return {
      reply: null,
      response: json(
        {
          error: "Workers AI request failed",
          detail: error instanceof Error ? error.message : "Unknown error",
          step: "style",
          mode: "ai_error",
        },
        502,
        env,
      ),
    };
  }
}

async function parseJsonRequest<T>(request: Request, env: Env): Promise<{ payload: T | null; response: Response | null }> {
  try {
    return {
      payload: (await request.json()) as T,
      response: null,
    };
  } catch {
    return {
      payload: null,
      response: json({ error: "Invalid JSON body" }, 400, env),
    };
  }
}

async function handleReply(request: Request, env: Env): Promise<Response> {
  const parsed = await parseJsonRequest<ReplyRequest>(request, env);
  if (parsed.response) {
    return parsed.response;
  }

  const payload = parsed.payload as ReplyRequest;
  const draft = await handleDraftReply(payload, env);
  if (draft.response) {
    return draft.response;
  }

  const styled = await handleStyleReply(
    {
      ...payload,
      draft_reply: draft.draftReply ?? undefined,
    },
    env,
  );
  if (styled.response) {
    return styled.response;
  }

  return json(
    {
      reply: styled.reply,
      draft_reply: draft.draftReply,
    },
    200,
    env,
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: buildCorsHeaders(env),
      });
    }

    if (request.method === "GET" && url.pathname === "/") {
      return json(
        {
          name: "masuda-ai",
          ok: true,
          endpoints: {
            health: "GET /health",
            draftReply: "POST /draft-reply",
            styleReply: "POST /style-reply",
            reply: "POST /reply",
          },
        },
        200,
        env,
      );
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json(
        {
          ok: true,
          draft_model: env.DRAFT_MODEL ?? DEFAULT_DRAFT_MODEL,
          style_model: env.STYLE_MODEL ?? DEFAULT_STYLE_MODEL,
        },
        200,
        env,
      );
    }

    if (request.method === "POST" && url.pathname === "/reply") {
      return handleReply(request, env);
    }

    if (request.method === "POST" && url.pathname === "/draft-reply") {
      const parsed = await parseJsonRequest<ReplyRequest>(request, env);
      if (parsed.response) {
        return parsed.response;
      }

      const result = await handleDraftReply(parsed.payload as ReplyRequest, env);
      if (result.response) {
        return result.response;
      }

      return json(
        {
          draft_reply: result.draftReply,
        },
        200,
        env,
      );
    }

    if (request.method === "POST" && url.pathname === "/style-reply") {
      const parsed = await parseJsonRequest<StyleReplyRequest>(request, env);
      if (parsed.response) {
        return parsed.response;
      }

      const result = await handleStyleReply(parsed.payload as StyleReplyRequest, env);
      if (result.response) {
        return result.response;
      }

      return json(
        {
          reply: result.reply,
        },
        200,
        env,
      );
    }

    return json({ error: "Not found" }, 404, env);
  },
};
