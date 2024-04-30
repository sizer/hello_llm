import { Tag } from "./domain";
import { oneMonthAgo } from "./lib/date";
import { summarizeTextByDify, tagTextByDify } from "./repositories/dify";
import { fetchPagesFromNotion, updatePageSummaryNotion, fetchTagsFromNotion, fetchPageSummariesFromNotion, updatePageTagNotion, createTagPageNotion } from "./repositories/notion";
import { batchWriteSummaryFrom } from "./usecases/batchWriteSummaryFrom";

import { Client as NotionClient } from '@notionhq/client';

const NOTION_TOKEN = 'xxx';

const notionClient = new NotionClient({
    auth: NOTION_TOKEN,
});

batchWriteSummaryFrom({
    from: oneMonthAgo(),
    repositories: {
        fetchPages: fetchPagesFromNotion(notionClient),
        createSummary: summarizeTextByDify,
        updatePageSummary: updatePageSummaryNotion(notionClient),
        fetchTags: fetchTagsFromNotion(notionClient),
    }
});

fetchTagsFromNotion(notionClient)(50)
    .then(async (tags: Tag[]) => {
        const pages = await fetchPageSummariesFromNotion(notionClient)("2000-01-01");
        console.log("count", pages.length);
        for (const page of pages) {
            const pageTags = await tagTextByDify(page, tags);
            updatePageTagNotion(notionClient)(page, pageTags);
        }
        return undefined;
    })
    .then(console.log);
