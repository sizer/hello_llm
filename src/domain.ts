// Domain
export interface Page {
    id: string;
    content: string;
}

export interface Tag {
    id: string;
    name: string;
}

export interface Repository {
    fetchPages: (from: string) => Promise<Page[]>;
    updatePageSummary: (page: Page, summary: string) => Promise<void>;
    createSummary: (page: Page) => Promise<string>;
    fetchTags: (limit: number) => Promise<Tag[]>;
}
