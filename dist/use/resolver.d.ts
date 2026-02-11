/**
 * Blueprint source resolver — handles local files and URL downloads
 */
export type BlueprintSource = {
    type: 'local';
    path: string;
} | {
    type: 'url';
    url: string;
};
export declare function parseSource(input: string): BlueprintSource;
export declare function resolveToLocalPath(source: BlueprintSource): Promise<string>;
//# sourceMappingURL=resolver.d.ts.map