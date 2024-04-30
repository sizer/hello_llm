import { Page, Tag } from "../domain";

const DIFY_KPY_API_KEY = "app-xxx";
const DIFY_API_BASE_URL = "https://api.dify.ai/v1";
const DIFY_API_USER_NAME = "hello_llm";

export const summarizeTextByDify = async (page: Page): Promise<string> => {
    const response = await fetch(`${DIFY_API_BASE_URL}/completion-messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${DIFY_KPY_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: { query: page.content },
            response_mode: "blocking",
            user: DIFY_API_USER_NAME
        }),
    });
    const { answer } = await response.json();
    return answer;
}

const DIFY_CATEGORY_API_KEY = "app-xxx";
export const tagTextByDify = async (page: Page, tags: Tag[]): Promise<Tag[]> => {
    const response = await fetch(`${DIFY_API_BASE_URL}/completion-messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${DIFY_CATEGORY_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: {
                content: page.content,
                tags: tags.map(({ name }) => name).join("、")
            },
            response_mode: "blocking",
            user: DIFY_API_USER_NAME
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