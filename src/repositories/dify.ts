import { Page, Tag } from "../domain";

const DIFY_API_BASE_URL = "https://api.dify.ai/v1";

export const summarizeTextByDify = ({user, apiKey}: {user: string, apiKey: string}) => async (page: Page): Promise<string> => {
    const response = await fetch(`${DIFY_API_BASE_URL}/completion-messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: { query: page.content },
            response_mode: "blocking",
            user
        }),
    });
    const { answer } = await response.json();
    return answer;
}

export const tagTextByDify = ({user, apiKey}: {user: string, apiKey: string}) => async (page: Page, tags: Tag[]): Promise<Tag[]> => {
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
            user
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