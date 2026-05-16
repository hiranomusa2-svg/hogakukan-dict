exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { word, dictName, url } = JSON.parse(event.body || "{}");

  if (!word || !dictName) {
    return { statusCode: 400, body: "Missing fields" };
  }

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const NOTION_DB_ID = process.env.NOTION_DB_ID;

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

  if (!res.ok) {
    const err = await res.text();
    console.error("Notion error:", err);
    return { statusCode: 500, body: "Notion API error" };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
