import { Client as NotionClient } from '@notionhq/client';

import { batchWriteSummary, batchWriteTag } from "./usecases";

import {
    fetchPagesFromNotion,
    updatePageSummaryNotion,
    fetchTagsFromNotion,
    fetchPageSummariesFromNotion,
    updatePageTagNotion
} from "./repositories/notion";
import { summarizeTextByDify, tagTextByDify } from "./repositories/dify";

import { oneMonthAgo } from "./lib/date";

const NOTION_TOKEN = 'xxx';
const DATABASE_ID_DB_INPUTS = 'xxx'
const DATABASE_ID_DB_TAG = "xxx"

const DIFY_SUMMARIZE_API_KEY = "app-xxx";
const DIFY_CATEGORY_API_KEY = "app-xxx";
const DIFY_API_USER_NAME = "xxx";

const notionClient = new NotionClient({
    auth: NOTION_TOKEN,
});

async function main() {
    await batchWriteSummary({
        from: oneMonthAgo(),
        deps: {
            fetchPages: fetchPagesFromNotion({ client: notionClient, databaseId: DATABASE_ID_DB_INPUTS }),
            updatePageSummary: updatePageSummaryNotion(notionClient),
            createSummary: summarizeTextByDify({ user: DIFY_API_USER_NAME, apiKey: DIFY_SUMMARIZE_API_KEY }),
        }
    });

    await batchWriteTag({
        from: oneMonthAgo(),
        deps: {
            fetchTags: fetchTagsFromNotion({ client: notionClient, databaseId: DATABASE_ID_DB_TAG }),
            fetchPages: fetchPageSummariesFromNotion({ client: notionClient, databaseId: DATABASE_ID_DB_INPUTS }),
            updatePageTag: updatePageTagNotion({ client: notionClient, databaseId: DATABASE_ID_DB_TAG }),
            createTag: tagTextByDify({ user: DIFY_API_USER_NAME, apiKey: DIFY_CATEGORY_API_KEY })
        }
    });
}

main();
