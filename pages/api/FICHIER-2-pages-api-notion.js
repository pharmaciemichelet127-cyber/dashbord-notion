import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function getPageContent(pageId) {
  try {
    const response = await notion.blocks.children.list({ block_id: pageId, page_size: 5 });
    const texts = [];
    for (const block of response.results) {
      const type = block.type;
      const content = block[type];
      if (content?.rich_text) {
        const text = content.rich_text.map((t) => t.plain_text).join("");
        if (text.trim()) texts.push(text.trim());
      }
      if (texts.length >= 3) break;
    }
    return texts.join(" · ").slice(0, 160);
  } catch {
    return "";
  }
}

export default async function handler(req, res) {
  if (!process.env.NOTION_TOKEN) {
    return res.status(500).json({ error: "NOTION_TOKEN manquant" });
  }

  try {
    // Search all pages and databases
    const response = await notion.search({
      page_size: 50,
      sort: { direction: "descending", timestamp: "last_edited_time" },
    });

    const items = await Promise.all(
      response.results.map(async (item) => {
        const isPage = item.object === "page";
        const isDb = item.object === "database";

        // Get title
        let title = "Sans titre";
        if (isPage) {
          const titleProp = item.properties?.title || item.properties?.Name;
          if (titleProp?.title) {
            title = titleProp.title.map((t) => t.plain_text).join("") || "Sans titre";
          }
        } else if (isDb) {
          title = item.title?.map((t) => t.plain_text).join("") || "Base de données";
        }

        // Get icon/emoji
        let emoji = isDb ? "🗄️" : "📄";
        if (item.icon?.type === "emoji") emoji = item.icon.emoji;

        // Get preview text for pages
        let preview = "";
        if (isPage) {
          preview = await getPageContent(item.id);
        } else if (isDb) {
          // Count entries in the database
          try {
            const dbQuery = await notion.databases.query({ database_id: item.id, page_size: 1 });
            preview = `Base de données · ${dbQuery.results.length > 0 ? "Contient des entrées" : "Vide"}`;
          } catch {
            preview = "Base de données";
          }
        }

        // Get properties for database pages
        let properties = {};
        if (isPage && item.parent?.type === "database_id") {
          properties = Object.entries(item.properties || {}).reduce((acc, [key, val]) => {
            let value = null;
            switch (val.type) {
              case "title": value = val.title?.map((t) => t.plain_text).join(""); break;
              case "rich_text": value = val.rich_text?.map((t) => t.plain_text).join(""); break;
              case "select": value = val.select?.name; break;
              case "multi_select": value = val.multi_select?.map((s) => s.name).join(", "); break;
              case "status": value = val.status?.name; break;
              case "checkbox": value = val.checkbox ? "✓" : "✗"; break;
              case "date": value = val.date?.start; break;
              case "number": value = val.number?.toString(); break;
              case "email": value = val.email; break;
              case "phone_number": value = val.phone_number; break;
              case "url": value = val.url; break;
            }
            if (value !== null && value !== undefined && value !== "") {
              acc[key] = value;
            }
            return acc;
          }, {});
        }

        return {
          id: item.id,
          type: item.object,
          title,
          emoji,
          preview,
          url: item.url,
          lastEdited: item.last_edited_time,
          created: item.created_time,
          parentType: item.parent?.type || "workspace",
          properties,
          cover: item.cover?.type === "external" ? item.cover.external.url : item.cover?.type === "file" ? item.cover.file.url : null,
        };
      })
    );

    // Group by parent type
    const workspace = items.filter((i) => i.parentType === "workspace");
    const inDatabase = items.filter((i) => i.parentType === "database_id");
    const inPage = items.filter((i) => i.parentType === "page_id");

    const databases = items.filter((i) => i.type === "database");
    const pages = items.filter((i) => i.type === "page");

    res.status(200).json({
      items,
      stats: {
        total: items.length,
        pages: pages.length,
        databases: databases.length,
        workspaceLevel: workspace.length,
        lastEdited: items[0]?.lastEdited || null,
      },
    });
  } catch (error) {
    console.error("Notion error:", error);
    res.status(500).json({ error: error.message });
  }
}
