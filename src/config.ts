import { Client as NotionClient } from "@notionhq/client";

export interface AppConfig {
    notion: {
        client: NotionClient;
        databaseIdInputs: string;
        databaseIdTag: string;
    };
    dify: {
        summarizeApiKey: string;
        categoryApiKey: string;
        userName: string;
    };
}

export const config = (): AppConfig => {
    const notionToken = process.env.NOTION_TOKEN;
    const databaseIdInputs = process.env.DATABASE_ID_DB_INPUTS;
    const databaseIdTag = process.env.DATABASE_ID_DB_TAG;
    const summarizeApiKey = process.env.DIFY_SUMMARIZE_API_KEY;
    const categoryApiKey = process.env.DIFY_CATEGORY_API_KEY;
    const userName = process.env.DIFY_API_USER_NAME;

    if (!notionToken) {
        throw new Error("Environment Variable NOTION_TOKEN not found.");
    }

    if (!databaseIdInputs) {
        throw new Error("Environment Variable DATABASE_ID_DB_INPUTS not found.");
    }

    if (!databaseIdTag) {
        throw new Error("Environment Variable DATABASE_ID_DB_TAG not found.");
    }

    if (!summarizeApiKey) {
        throw new Error("Environment Variable DIFY_SUMMARIZE_API_KEY not found.");
    }

    if (!categoryApiKey) {
        throw new Error("Environment Variable DIFY_CATEGORY_API_KEY not found.");
    }

    if (!userName) {
        throw new Error("Environment Variable DIFY_API_USER_NAME not found.");
    }

    const notionClient = new NotionClient({
        auth: notionToken,
    });

    return {
        notion: {
            client: notionClient,
            databaseIdInputs,
            databaseIdTag
        },
        dify: {
            summarizeApiKey,
            categoryApiKey,
            userName
        }
    }
}
