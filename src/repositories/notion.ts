import { Client as NotionClient } from '@notionhq/client';
import { Page, Tag } from '../domain';

const DATABASE_ID_DB_INPUTS = 'xxx'
const DATABASE_ID_DB_TAG = "xxx"

export const fetchPageSummariesFromNotion = (client: NotionClient) => async (createdAfter: string): Promise<Page[]> => {
    const { results } = await client.databases.query({
        database_id: DATABASE_ID_DB_INPUTS,
        filter: {
            and: [{
                property: 'Summary',
                rich_text: { is_not_empty: true }
            }, {
                property: 'Created',
                date: { on_or_after: createdAfter }
            }, {
                property: 'Tag',
                relation: { is_empty: true }
            }]
        },
        sorts: [{
            property: 'Updated',
            direction: 'ascending',
        }],
        page_size: 100,
    });

    return results.map(({ id, properties }: any) => (
        {
            id,
            content: properties.Summary.rich_text.map((text: any) => text.plain_text).join(''),
        })
    );
}

export const fetchPagesFromNotion = (client: NotionClient) => async (createdAfter: string): Promise<Page[]> => {
    const { results } = await client.databases.query({
        database_id: DATABASE_ID_DB_INPUTS,
        filter: {
            and: [{
                property: 'Summary',
                rich_text: { is_empty: true }
            }, {
                // Exclude YouTube videos, because they doesn't have text content
                property: 'Source',
                select: { does_not_equal: 'YouTube' }
            }, {
                property: 'Created',
                date: { on_or_after: createdAfter }
            }]
        },
        sorts: [{
            property: 'Updated',
            direction: 'ascending',
        }],
        page_size: 100,
    });

    return Promise.all(
        results.map(async ({ id }) => {
            const pageContentData = await fetchPageContentFromNotionAsText(client, id);
            if (pageContentData === '') {
                console.log('No content found for page:', id);
                return undefined;
            }
            return { id, content: pageContentData };
        })
    ).then((pages) => pages.filter((page): page is Page => page !== undefined));
};

const fetchPageContentFromNotionAsText = async (client: NotionClient, pageId: string): Promise<string> => {
    const pageContentData = await client.blocks.children.list({
        block_id: pageId,
        page_size: 50,
    })
    const pageContentString = pageContentData.results.map((block) => {
        if ('type' in block && block.type === 'paragraph') {
            return block.paragraph.rich_text.map((text) => text.plain_text).join('');
        } else {
            return '';
        }
    }).join('');
    return pageContentString;
};

export const updatePageSummaryNotion = (client: NotionClient) => async (page: Page, summary: string) => {
    await client.pages.update({
        page_id: page.id,
        properties: {
            Summary: {
                type: 'rich_text',
                rich_text: [{
                    type: 'text',
                    text: {
                        content: summary,
                    },
                }],
            },
        },
    });
}

export const fetchTagsFromNotion = (client: NotionClient) => async (limit: number) => {
    const { results } = await client.databases.query({
        database_id: DATABASE_ID_DB_TAG,
        sorts: [{
            property: 'Inputs',
            direction: 'descending',
        }, {
            property: 'Last edited time',
            direction: 'descending',
        }, {
            property: 'Name',
            direction: 'ascending',
        }],
        page_size: limit,
    });

    return results.map((result) => {
        const { id, properties } = result as any;
        return {
            id,
            name: properties.Name.title[0].plain_text,
        };
    });
}

export const createTagPageNotion = (client: NotionClient) => async (tag: Tag) => {
    const { id } = await client.pages.create({
        parent: {
            database_id: DATABASE_ID_DB_TAG,
        },
        properties: {
            Name: {
                type: 'title',
                title: [{
                    type: 'text',
                    text: {
                        content: tag.name,
                    },
                }],
            },
        },
    });

    return { ...tag, id };
}

export const updatePageTagNotion = (client: NotionClient) => async (page: Page, tags: Tag[]) => {
    const latestTags = await Promise.all(
        tags.map(async (tag) => {
            const { results } = await client.databases.query({
                database_id: DATABASE_ID_DB_TAG,
                filter: {
                    property: 'Name',
                    rich_text: { equals: tag.name },
                },
                page_size: 1,
            });
            if (results.length === 0) {
                return await createTagPageNotion(client)(tag);
            } else {
                return { id: results[0].id, name: tag.name };
            }
        })
    );


    await client.pages.update({
        page_id: page.id,
        properties: {
            Tag: {
                type: 'relation',
                relation: latestTags.map((tag) => ({ id: tag.id })),
            },
        },
    });
}
