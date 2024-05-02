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
import { config } from './config';

const appConfig = config();

async function main() {
    await batchWriteSummary({
        from: oneMonthAgo(),
        deps: {
            fetchPages: fetchPagesFromNotion({ config: appConfig }),
            updatePageSummary: updatePageSummaryNotion({ config: appConfig }),
            createSummary: summarizeTextByDify({ config: appConfig }),
        }
    });

    await batchWriteTag({
        from: oneMonthAgo(),
        deps: {
            fetchTags: fetchTagsFromNotion({ config: appConfig }),
            fetchPages: fetchPageSummariesFromNotion({ config: appConfig }),
            updatePageTag: updatePageTagNotion({ config: appConfig }),
            createTag: tagTextByDify({ config: appConfig })
        }
    });
}

main();
