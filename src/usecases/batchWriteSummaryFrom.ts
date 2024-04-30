import { Repository } from "../domain";

// Usecases
export async function batchWriteSummaryFrom({
    from,
    repositories
}: {
    from: string,
    repositories: Repository
}) {
    const {
        fetchPages: fetchContents,
        createSummary,
        updatePageSummary: updateContentSummary
    } = repositories;

    try {
        const pages = await fetchContents(from);
        for (const page of pages) {
            const summary = await createSummary(page);
            await updateContentSummary(page, summary);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
