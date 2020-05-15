declare module 'lighthouse' {
  export type AuditKinds = keyof typeof import('./constants').AuditKindsEnum;
  export type CategoryKinds = keyof typeof import('./constants').CategoryKindsEnum;

  export interface Options {
    port?: number;
    onlyCategories: Array<string>;
  }

  interface AuditKindDetail {
    id: string;
    title: string;
    score: number;
    numericValue: number;
  }

  interface CategoryKindDetail {
    title: string;
    id: string;
    score: number;
  }

  export interface Report {
    audits: {
      [key in AuditKinds]: AuditKindDetail;
    };
    categories: {
      [key in CategoryKinds]: CategoryKindDetail;
    };
  }

  export interface Result {
    lhr: Report;
  }

  export default function (url: string, opts: Options): Promise<Result>;
}
