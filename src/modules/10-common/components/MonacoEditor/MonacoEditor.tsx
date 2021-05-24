import React, { MutableRefObject } from 'react'
import ReactMonacoEditor from 'react-monaco-editor'
import type { MonacoEditorProps } from 'react-monaco-editor'

export type ReactMonacoEditorRef =
  | ((instance: ReactMonacoEditor | null) => void)
  | MutableRefObject<ReactMonacoEditor | null>
  | null

const MonacoEditor = (props: MonacoEditorProps, ref: ReactMonacoEditorRef) => {
  React.useEffect(() => {
    const remeasureFonts = () => {
      //@ts-ignore
      monaco?.editor?.remeasureFonts()
    }

    // TODO: font name should be a global (for all)
    const loaded = (document as any).fonts?.check?.('1em Roboto Mono')

    if (loaded) {
      remeasureFonts()
    } else {
      ;(document as any).fonts?.ready?.then?.(remeasureFonts)
    }
  }, [])

  const editorDidMount = () => {
    if (props.options?.readOnly) {
      monaco?.editor?.defineTheme('disable-theme', {
        base: 'vs',
        inherit: true,
        rules: [{ background: 'd9dae5' }],
        colors: {
          'editor.background': '#d9dae5'
        }
      })
      monaco?.editor?.setTheme('disable-theme')
    }
  }

  return <ReactMonacoEditor {...props} ref={ref} editorDidMount={editorDidMount} />
}

export default React.forwardRef(MonacoEditor)
