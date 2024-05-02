// Domain
export interface Page {
    id: string;
    content: string;
}

export interface Tag {
    id: string;
    name: string;
}

export interface BatchWriteSummaryDependencies {
    fetchPages: (from: string) => Promise<Page[]>;
    updatePageSummary: (page: Page, summary: string) => Promise<void>;
    createSummary: (page: Page) => Promise<string>;
}

export interface BatchWriteTagDependencies {
    fetchTags: (count: number) => Promise<Tag[]>;
    fetchPages: (from: string) => Promise<Page[]>;
    updatePageTag: (page: Page, tags: Tag[]) => Promise<void>;
    createTag: (page: Page, tags: Tag[]) => Promise<Tag[]>;
}
