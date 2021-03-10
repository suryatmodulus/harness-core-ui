import React, { useEffect, useState, useRef, ReactElement, useCallback } from 'react'
import MonacoEditor, { MonacoEditorProps } from 'react-monaco-editor'
import '@wings-software/monaco-yaml/lib/esm/monaco.contribution'
import { IKeyboardEvent, languages } from 'monaco-editor/esm/vs/editor/editor.api'
import type { editor } from 'monaco-editor/esm/vs/editor/editor.api'
//@ts-ignore
import YamlWorker from 'worker-loader!@wings-software/monaco-yaml/lib/esm/yaml.worker'
//@ts-ignore
import EditorWorker from 'worker-loader!monaco-editor/esm/vs/editor/editor.worker'
import { debounce, truncate } from 'lodash-es'
import type { Diagnostic } from 'vscode-languageserver-types'
import { useToaster } from '@common/exports'
import { useParams } from 'react-router-dom'
import SplitPane from 'react-split-pane'
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/exports'
import cx from 'classnames'
import { scalarOptions, stringify, defaultOptions } from 'yaml'
import { Tag, Icon } from '@wings-software/uicore'
import type {
  YamlBuilderProps,
  YamlBuilderHandlerBinding,
  CompletionItemInterface,
  Theme
} from '@common/interfaces/YAMLBuilderProps'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import SnippetSection from '@common/components/SnippetSection/SnippetSection'
import { validateYAMLWithSchema, getSchemaWithLanguageSettings } from '@common/utils/YamlUtils'
import { sanitize } from '@common/utils/JSONUtils'
import { getYAMLFromEditor, getMetaDataForKeyboardEventProcessing, getYAMLValidationErrors } from './YAMLBuilderUtils'

import css from './YamlBuilder.module.scss'
import './resizer.scss'
import {
  DEFAULT_EDITOR_HEIGHT,
  EditorTheme,
  EDITOR_BASE_DARK_THEME,
  EDITOR_BASE_LIGHT_THEME,
  EDITOR_DARK_BG,
  EDITOR_DARK_FG,
  EDITOR_DARK_SELECTION,
  EDITOR_LIGHT_BG,
  EDITOR_WHITESPACE,
  MIN_SNIPPET_SECTION_WIDTH,
  TRIGGER_CHARS_FOR_NEW_EXPR,
  TRIGGER_CHAR_FOR_PARTIAL_EXPR,
  KEY_CODE_FOR_PLUS_SIGN,
  ANGULAR_BRACKET_CHAR,
  KEY_CODE_FOR_SEMI_COLON,
  KEY_CODE_FOR_PERIOD,
  KEY_CODE_FOR_SPACE,
  KEY_CODE_FOR_CHAR_Z,
  MAX_ERR_MSSG_LENGTH
} from './YAMLBuilderConstants'

// Please do not remove this, read this https://eemeli.org/yaml/#scalar-options
scalarOptions.str.fold.lineWidth = 100000
defaultOptions.indent = 4

const getTheme = (theme: Theme) => (theme === 'DARK' ? EDITOR_BASE_DARK_THEME : EDITOR_BASE_LIGHT_THEME)

const setUpEditor = (theme: Theme): void => {
  //@ts-ignore
  monaco.editor.defineTheme(getTheme(theme), {
    base: getTheme(theme),
    inherit: theme === 'DARK',
    rules: theme === 'DARK' ? EditorTheme.DARK : EditorTheme.LIGHT,
    colors:
      theme === 'DARK'
        ? {
            'editor.background': `#${EDITOR_DARK_BG}`,
            'editor.foreground': `#${EDITOR_DARK_FG}`,
            'editor.selectionBackground': `#${EDITOR_DARK_SELECTION}`,

            'editor.lineHighlightBackground': `#${EDITOR_DARK_SELECTION}`,
            'editorCursor.foreground': `#${EDITOR_DARK_FG}`,
            'editorWhitespace.foreground': `#${EDITOR_WHITESPACE}`
          }
        : { 'editor.background': `#${EDITOR_LIGHT_BG}` }
  })
  //@ts-ignore
  monaco.editor.setTheme(getTheme(theme))

  //@ts-ignore
  window.MonacoEnvironment = {
    getWorker(_workerId: unknown, label: string) {
      if (label === 'yaml') {
        return new YamlWorker()
      }
      return new EditorWorker()
    }
  }
}

const YAMLBuilder: React.FC<YamlBuilderProps> = (props: YamlBuilderProps): JSX.Element => {
  const {
    height,
    width,
    fileName,
    entityType,
    existingJSON,
    isReadOnlyMode,
    showSnippetSection = true,
    invocationMap,
    bind,
    showIconMenu = false,
    onExpressionTrigger,
    snippets,
    onSnippetCopy,
    snippetFetchResponse,
    schema,
    onEnableEditMode,
    theme = 'LIGHT',
    yamlSanityConfig,
    onChange
  } = props
  setUpEditor(theme)
  const params = useParams()
  const [currentYaml, setCurrentYaml] = useState<string>('')
  const [yamlValidationErrors, setYamlValidationErrors] = useState<Map<number, string> | undefined>()
  const [dynamicWidth, setDynamicWidth] = useState<number>(DEFAULT_EDITOR_HEIGHT)

  const editorRef = useRef<MonacoEditor>(null)
  const yamlRef = useRef<string | undefined>('')
  const yamlValidationErrorsRef = useRef<Map<number, string>>()
  yamlValidationErrorsRef.current = yamlValidationErrors
  const editorVersionRef = useRef<number>()

  let expressionCompletionDisposer: { dispose: () => void }
  let runTimeCompletionDisposer: { dispose: () => void }

  const { showError } = useToaster()
  const { getString } = useStrings()

  const handler = React.useMemo(
    () =>
      ({
        getLatestYaml: () => yamlRef.current,
        getYAMLValidationErrorMap: () => yamlValidationErrorsRef.current
      } as YamlBuilderHandlerBinding),
    []
  )

  useEffect(() => {
    bind?.(handler)
  }, [bind, handler])

  useEffect(() => {
    setDynamicWidth(width as number)
  }, [width])

  const handleResize = (newSize: number): void => {
    setDynamicWidth(newSize)
  }

  const getEditorCurrentVersion = (): number | undefined => {
    return editorRef.current?.editor?.getModel()?.getAlternativeVersionId()
  }

  const replacer = (_key: string, value: unknown) => (typeof value === 'undefined' ? '' : value)

  const verifyIncomingJSON = (jsonObj?: Record<string, any>): void => {
    const jsonObjWithoutNulls = JSON.parse(JSON.stringify(jsonObj, replacer).replace(/:\s*null/g, ':""')) as Record<
      string,
      any
    >
    const sanitizedJSONObj = sanitize(jsonObjWithoutNulls, yamlSanityConfig)
    if (sanitizedJSONObj && Object.keys(sanitizedJSONObj).length > 0) {
      const yamlEqOfJSON = stringify(sanitizedJSONObj)
      const sanitizedYAML = yamlEqOfJSON.replace(': null\n', ': \n')
      setCurrentYaml(sanitizedYAML)
      yamlRef.current = sanitizedYAML
      verifyYAML(sanitizedYAML)
    } else {
      setCurrentYaml('')
      yamlRef.current = ''
      setYamlValidationErrors(undefined)
    }
  }

  /* #region Bootstrap editor with schema */

  useEffect(() => {
    verifyIncomingJSON(existingJSON)
  }, [JSON.stringify(existingJSON)])

  useEffect(() => {
    if (schema) {
      const languageSettings = getSchemaWithLanguageSettings(schema)
      setUpYAMLBuilderWithLanguageSettings(languageSettings)
    }
  }, [schema])

  const setUpYAMLBuilderWithLanguageSettings = (languageSettings: string | Record<string, any>): void => {
    //@ts-ignore
    const { yaml } = languages || {}
    yaml?.yamlDefaults.setDiagnosticsOptions(languageSettings)
  }

  /* #endregion */

  /* #region Handle various interactions with the editor */

  const onYamlChange = debounce((updatedYaml: string): void => {
    setCurrentYaml(updatedYaml)
    yamlRef.current = updatedYaml
    verifyYAML(updatedYaml)
    onChange?.(editorVersionRef.current ? editorVersionRef.current + 1 !== getEditorCurrentVersion() : false)
  }, 500)

  const verifyYAML = (updatedYaml: string): void => {
    if (schema) {
      if (updatedYaml) {
        try {
          validateYAMLWithSchema(updatedYaml, getSchemaWithLanguageSettings(schema))
            .then((errors: Diagnostic[]) => {
              setYamlValidationErrors(getYAMLValidationErrors(errors))
            })
            .catch((error: string) => {
              showError(error, 5000)
            })
        } catch (err) {
          showError(getString('yamlBuilder.yamlError'))
        }
      } else {
        setYamlValidationErrors(undefined)
      }
    }
  }

  const editorDidMount = (editor: editor.IStandaloneCodeEditor): void => {
    editorVersionRef.current = editor.getModel()?.getAlternativeVersionId()
    if (!props.isReadOnlyMode) {
      editor?.focus()
    }
    editor.onKeyDown((event: IKeyboardEvent) => handleEditorKeyDownEvent(event, editor))
  }

  const disposePreviousSuggestions = (): void => {
    if (expressionCompletionDisposer) {
      expressionCompletionDisposer.dispose()
    }
    if (runTimeCompletionDisposer) {
      runTimeCompletionDisposer.dispose()
    }
  }

  /* #endregion */

  /* #region Custom invocations */

  /** Expressions support */
  const getEditorContentInCurrentLine = (editor: editor.IStandaloneCodeEditor): string | undefined => {
    const currentLineNum = editor.getPosition()?.lineNumber
    if (currentLineNum) {
      return editor.getModel()?.getLineContent(currentLineNum)
    }
  }

  const getExpressionFromCurrentLine = (editor: editor.IStandaloneCodeEditor): string | undefined => {
    const expression = getEditorContentInCurrentLine(editor)
      ?.split(':')
      .map((item: string) => item.trim())?.[1]
    return expression
  }

  function registerCompletionItemProviderForExpressions(
    editor: editor.IStandaloneCodeEditor,
    triggerCharacters: string[],
    matchingPath: string | undefined,
    currentExpression: string | undefined = ''
  ): void {
    if (editor && matchingPath) {
      const suggestionsPromise = onExpressionTrigger ? onExpressionTrigger(matchingPath, currentExpression) : null
      if (suggestionsPromise) {
        suggestionsPromise.then(suggestions => {
          // @ts-ignore
          expressionCompletionDisposer = monaco?.languages?.registerCompletionItemProvider('yaml', {
            triggerCharacters,
            provideCompletionItems: () => {
              return { suggestions }
            }
          })
        })
      }
    }
  }

  /** Run-time Inputs support */
  function registerCompletionItemProviderForRTInputs(
    editor: editor.IStandaloneCodeEditor,
    suggestionsPromise: Promise<CompletionItemInterface[]>
  ): void {
    if (editor) {
      suggestionsPromise.then(suggestions => {
        // @ts-ignore
        runTimeCompletionDisposer = monaco?.languages?.registerCompletionItemProvider('yaml', {
          triggerCharacters: [' '],
          provideCompletionItems: () => {
            return { suggestions }
          }
        })
      })
    }
  }

  const invokeCallBackForMatchingYAMLPaths = (
    editor: editor.IStandaloneCodeEditor,
    matchingPath: string | undefined
  ): void => {
    if (editor && matchingPath) {
      invocationMap?.forEach((callBackFunc, yamlPath) => {
        if (matchingPath.match(yamlPath) && typeof callBackFunc === 'function') {
          const yamlFromEditor = getYAMLFromEditor(editor, true) as string
          const suggestionsPromise = callBackFunc(matchingPath, yamlFromEditor, params)
          registerCompletionItemProviderForRTInputs(editor, suggestionsPromise)
        }
      })
    }
  }

  const shouldInvokeExpressions = (editor: editor.IStandaloneCodeEditor, event: IKeyboardEvent): boolean => {
    const lastKeyStrokeCharacter = getEditorContentInCurrentLine(editor)?.substr(-1)
    const { shiftKey, code } = event
    return lastKeyStrokeCharacter === ANGULAR_BRACKET_CHAR && shiftKey && code === KEY_CODE_FOR_PLUS_SIGN
  }

  /* #endregion */

  const { openDialog } = useConfirmationDialog({
    contentText: getString('yamlBuilder.enableEditContext'),
    titleText: getString('confirm'),
    confirmButtonText: getString('enable'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async didConfirm => {
      if (didConfirm) {
        onEnableEditMode?.()
      }
    }
  })

  const handleEditorKeyDownEvent = (event: IKeyboardEvent, editor: any): void => {
    if (props.isReadOnlyMode) {
      openDialog()
    }
    try {
      const { shiftKey, code, ctrlKey, metaKey } = event
      //TODO Need to check hotkey for cross browser/cross OS compatibility

      // this is to prevent reset of the editor to empty when there is no undo history
      if ((ctrlKey || metaKey) && code === KEY_CODE_FOR_CHAR_Z) {
        if (editorVersionRef.current && editorVersionRef.current + 1 === getEditorCurrentVersion()) {
          event.stopPropagation()
          event.preventDefault()
        }
      }
      if (ctrlKey && code === KEY_CODE_FOR_SPACE) {
        disposePreviousSuggestions()
      }
      if (shiftKey) {
        // this is to invoke expressions callback
        if (shouldInvokeExpressions(editor, event)) {
          const yamlPath = getMetaDataForKeyboardEventProcessing(editor)?.parentToCurrentPropertyPath
          disposePreviousSuggestions()
          registerCompletionItemProviderForExpressions(editor, TRIGGER_CHARS_FOR_NEW_EXPR, yamlPath)
        }
        // this is to invoke run-time inputs as suggestions
        else if (code === KEY_CODE_FOR_SEMI_COLON && invocationMap && invocationMap.size > 0) {
          const yamlPath = getMetaDataForKeyboardEventProcessing(editor, true)?.parentToCurrentPropertyPath
          disposePreviousSuggestions()
          invokeCallBackForMatchingYAMLPaths(editor, yamlPath)
        }
      }
      // this is to invoke partial expressions callback e.g. invoke expressions callback on hitting a period(.) after an expression: expr1.expr2. <-
      if (code === KEY_CODE_FOR_PERIOD) {
        const yamlPath = getMetaDataForKeyboardEventProcessing(editor)?.parentToCurrentPropertyPath
        disposePreviousSuggestions()
        registerCompletionItemProviderForExpressions(
          editor,
          [TRIGGER_CHAR_FOR_PARTIAL_EXPR],
          yamlPath,
          getExpressionFromCurrentLine(editor)
        )
      }
    } catch (err) {
      showError(getString('yamlBuilder.yamlError'))
    }
  }

  const getErrorSummary = (errorMap?: Map<number, string>): React.ReactElement => {
    const errors: React.ReactElement[] = []
    errorMap?.forEach((value, key) => {
      const error = (
        <li className={css.item} title={value} key={key}>
          {getString('yamlBuilder.lineNumberLabel')}&nbsp;
          {key + 1},&nbsp;
          {truncate(value.toLowerCase(), { length: MAX_ERR_MSSG_LENGTH })}
        </li>
      )
      errors.push(error)
    })
    return (
      <div className={css.errorSummary}>
        <ol className={css.errorList}>{errors}</ol>
      </div>
    )
  }

  const renderSnippetSection = (): ReactElement => {
    return (
      <SnippetSection
        showIconMenu={showIconMenu}
        entityType={entityType}
        snippets={snippets}
        onSnippetCopy={onSnippetCopy}
        snippetFetchResponse={snippetFetchResponse}
      />
    )
  }

  const renderHeader = useCallback(
    (): JSX.Element => (
      <div className={cx(css.header)}>
        <div className={css.flexCenter}>
          <span className={cx(css.filePath, css.flexCenter, { [css.lightBg]: theme === 'DARK' })}>{fileName}</span>
          {fileName && entityType ? <Tag className={css.entityTag}>{entityType}</Tag> : null}
        </div>
        <div className={cx(css.flexCenter, css.validationStatus)}>
          {yamlValidationErrors && yamlValidationErrors.size > 0 ? (
            <Popover
              interactionKind={PopoverInteractionKind.HOVER}
              position={Position.TOP}
              content={getErrorSummary(yamlValidationErrors)}
              popoverClassName={css.summaryPopover}
            >
              <div>
                <Icon name="main-issue-filled" size={14} className={css.validationIcon} />
                <span className={css.invalidYaml}>{getString('invalidText')}</span>
              </div>
            </Popover>
          ) : null}
        </div>
      </div>
    ),
    [yamlValidationErrors, fileName, entityType, theme]
  )

  const renderEditor = useCallback(
    (): JSX.Element => (
      <MonacoEditor
        width={dynamicWidth ?? 2 * MIN_SNIPPET_SECTION_WIDTH}
        height={height ?? DEFAULT_EDITOR_HEIGHT}
        language="yaml"
        value={currentYaml}
        onChange={onYamlChange}
        editorDidMount={editorDidMount}
        options={
          {
            readOnly: isReadOnlyMode,
            wordBasedSuggestions: false,
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 13,
            minimap: {
              enabled: false
            }
          } as MonacoEditorProps['options']
        }
        ref={editorRef}
      />
    ),
    [dynamicWidth, height, currentYaml, onYamlChange]
  )

  useEffect(() => {
    return () => {
      disposePreviousSuggestions()
    }
  }, [])

  return (
    <div className={cx(css.main, { [css.darkBg]: theme === 'DARK' })}>
      {showSnippetSection ? (
        <SplitPane
          split="vertical"
          defaultSize={dynamicWidth ?? 2 * MIN_SNIPPET_SECTION_WIDTH}
          minSize={2 * MIN_SNIPPET_SECTION_WIDTH}
          className={css.splitPanel}
          onChange={handleResize}
          maxSize={-1 * MIN_SNIPPET_SECTION_WIDTH}
          style={{ height: height ?? DEFAULT_EDITOR_HEIGHT }}
        >
          <div className={css.editor}>
            {renderHeader()}
            {renderEditor()}
          </div>
          {showSnippetSection ? renderSnippetSection() : null}
        </SplitPane>
      ) : (
        <>
          <div className={css.editor}>
            {renderHeader()}
            {renderEditor()}
          </div>
        </>
      )}
    </div>
  )
}

export default YAMLBuilder
