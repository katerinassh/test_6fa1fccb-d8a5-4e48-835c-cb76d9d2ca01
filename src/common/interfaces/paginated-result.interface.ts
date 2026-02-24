export interface PaginatedResult<T> {
  readonly data: T[];
  readonly nextCursor: string | null;
  readonly meta?: {
    readonly totalCount?: number;
    readonly itemsPerPage: number;
  };
}