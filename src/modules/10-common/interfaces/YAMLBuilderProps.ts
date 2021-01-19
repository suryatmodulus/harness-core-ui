import type { CompletionItemKind } from 'vscode-languageserver-types'
import type { YamlSnippetMetaData, GetYamlSchemaQueryParams } from 'services/cd-ng'

export interface YamlBuilderHandlerBinding {
  getLatestYaml: () => string
  getYAMLValidationErrorMap: () => Map<string, string[]>
}

export type InvocationMapFunction = (
  matchingPath: string,
  currentYaml: string,
  params: Record<string, unknown>
) => Promise<CompletionItemInterface[]>

export interface YamlSanityConfig {
  removeEmptyString?: boolean
  removeEmptyArray?: boolean
  removeEmptyObject?: boolean
}
export interface YamlBuilderProps {
  /* Only YAMLBuilder related props */
  height?: React.CSSProperties['height']
  width?: React.CSSProperties['width']
  fileName: string
  existingJSON?: Record<string, any>
  entityType: GetYamlSchemaQueryParams['entityType']
  bind?: (dynamicPopoverHandler: YamlBuilderHandlerBinding) => void
  invocationMap?: Map<RegExp, InvocationMapFunction>
  isReadOnlyMode?: boolean
  onExpressionTrigger?: (yamlPath: string, currentExpression: string) => Promise<CompletionItemInterface[]>
  //TODO @vardan Remove "Record<string, string | any>" from type once pipeline schema is migrated to new framework
  schema?: string | Record<string, string | any>
  needEditorReset?: boolean
  onEnableEditMode?: () => void
  theme?: Theme
  yamlSanityConfig?: YamlSanityConfig
  /* Snippet section related props */
  showSnippetSection?: boolean
  showIconMenu?: boolean
  snippets?: YamlSnippetMetaData[]
  onSnippetCopy?: (identifier: string) => Promise<void>
  snippetYaml?: string
  skipValidation?: boolean
}

export interface CompletionItemInterface {
  label: string
  kind: CompletionItemKind
  insertText: string
}

interface SchemaInterace {
  fileMatch: string[]
  schema: string
}
export interface LanguageSettingInterface {
  validate: boolean
  enableSchemaRequest?: boolean
  hover: boolean
  completion: boolean
  schemas: SchemaInterace[]
}

export type Theme = 'LIGHT' | 'DARK'
