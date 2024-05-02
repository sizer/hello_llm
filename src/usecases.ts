import { BatchWriteSummaryDependencies, BatchWriteTagDependencies } from "./domain";

export async function batchWriteSummary({
    from,
    deps
}: {
    from: string,
    deps: BatchWriteSummaryDependencies
}) {
    const {
        fetchPages,
        createSummary,
        updatePageSummary
    } = deps;

    const pages = await fetchPages(from);
    for (const page of pages) {
        const summary = await createSummary(page);
        await updatePageSummary(page, summary);
    }
}

export async function batchWriteTag({
    from,
    deps
}: {
    from: string,
    deps: BatchWriteTagDependencies
}) {
    const {
        fetchTags,
        fetchPages,
        updatePageTag,
        createTag
    } = deps;

    const tags = await fetchTags(50)
    const pages = await fetchPages(from);
    console.log("count", pages.length);

    for (const page of pages) {
        const pageTags = await createTag(page, tags);
        updatePageTag(page, pageTags);
    }

    return undefined;
};
