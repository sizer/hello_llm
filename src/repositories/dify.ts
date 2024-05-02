import { AppConfig } from "../config";
import { Page, Tag } from "../domain";

const DIFY_API_BASE_URL = "https://api.dify.ai/v1";

export const summarizeTextByDify = ({ config }: { config: AppConfig }) => async (page: Page): Promise<string> => {
    const { userName, summarizeApiKey: apiKey } = config.dify;

    const response = await fetch(`${DIFY_API_BASE_URL}/completion-messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: { query: page.content },
            response_mode: "blocking",
            user: userName
        }),
    });
    const { answer } = await response.json();
    return answer;
}

export const tagTextByDify = ({ config }: { config: AppConfig }) => async (page: Page, tags: Tag[]): Promise<Tag[]> => {
    const { userName, categoryApiKey: apiKey } = config.dify;

    const response = await fetch(`${DIFY_API_BASE_URL}/completion-messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: {
                content: page.content,
                tags: tags.map(({ name }) => name).join("、")
            },
            response_mode: "blocking",
            user: userName
        }),
    });
    const { answer } = await response.json();
    try {
        return JSON.parse(answer).map((v: string) => {
            const tagExists = tags.find((tag) => tag.name === v);
            if (tagExists) {
                return tagExists;
            } else {
                return { id: undefined, name: v };
            }
        });
    } catch (e) {
        return answer.split(",").map((v: string) => v.trim().replaceAll('"', '')).map((v: string) => {
            const tagExists = tags.find((tag) => tag.name === v);
            if (tagExists) {
                return tagExists;
            } else {
                return { id: undefined, name: v };
            }
        })
    }
}