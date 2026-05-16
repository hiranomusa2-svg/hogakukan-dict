exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { word, dictName, url } = JSON.parse(event.body || "{}");

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const NOTION_DB_ID = process.env.NOTION_DB_ID;

  // デバッグ用：トークンとDBIDの先頭だけ返す
  if (!NOTION_TOKEN) {
    return { statusCode: 500, body: "NOTION_TOKEN is missing" };
  }
  if (!NOTION_DB_ID) {
    return { statusCode: 500, body: "NOTION_DB_ID is missing" };
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { database_id: NOTION_DB_ID },
      properties: {
        単語: {
          title: [{ text: { content: word } }],
        },
        辞書名: {
          rich_text: [{ text: { content: dictName } }],
        },
        検索日時: {
          date: { start: new Date().toISOString() },
        },
        コトバンクURL: {
          url: url || null,
        },
      },
    }),
  });

  const responseText = await res.text();

  if (!res.ok) {
    return { statusCode: 500, body: `Notion error: ${responseText}` };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
