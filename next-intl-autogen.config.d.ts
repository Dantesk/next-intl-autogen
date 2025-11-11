import { z } from 'zod';
export declare const ConfigSchema: z.ZodObject<{
    localesDir: z.ZodDefault<z.ZodString>;
    defaultLocale: z.ZodDefault<z.ZodString>;
    locales: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    sourceGlob: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    namespaceStrategy: z.ZodDefault<z.ZodEnum<["byFolder", "byFile", "custom"]>>;
    keyStrategy: z.ZodDefault<z.ZodEnum<["elementType_slug", "hash"]>>;
    dryRun: z.ZodDefault<z.ZodBoolean>;
    ignoreFilesUsingTranslations: z.ZodDefault<z.ZodBoolean>;
    placeholderTemplate: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    localesDir: string;
    defaultLocale: string;
    locales: string[];
    sourceGlob: string[];
    namespaceStrategy: "byFolder" | "byFile" | "custom";
    keyStrategy: "elementType_slug" | "hash";
    dryRun: boolean;
    ignoreFilesUsingTranslations: boolean;
    placeholderTemplate: string;
}, {
    localesDir?: string | undefined;
    defaultLocale?: string | undefined;
    locales?: string[] | undefined;
    sourceGlob?: string[] | undefined;
    namespaceStrategy?: "byFolder" | "byFile" | "custom" | undefined;
    keyStrategy?: "elementType_slug" | "hash" | undefined;
    dryRun?: boolean | undefined;
    ignoreFilesUsingTranslations?: boolean | undefined;
    placeholderTemplate?: string | undefined;
}>;
export type Config = z.infer<typeof ConfigSchema>;
export declare const defaultConfig: Config;
//# sourceMappingURL=next-intl-autogen.config.d.ts.map