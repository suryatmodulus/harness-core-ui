/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { MutableRefObject } from 'react'
import { MonacoDiffEditor as ReactMonacoDiffEditor } from 'react-monaco-editor'
import type { MonacoDiffEditorProps, DiffEditorWillMount } from 'react-monaco-editor'

export type ReactMonacoEditorRef =
  | ((instance: ReactMonacoDiffEditor | null) => void)
  | MutableRefObject<ReactMonacoDiffEditor | null>
  | null

export interface ExtendedMonacoDiffEditorProps extends MonacoDiffEditorProps {
  name?: string
  'data-testid'?: string
}

export type Monaco = Parameters<DiffEditorWillMount>[0]

const MonacoDiffEditor = (props: ExtendedMonacoDiffEditorProps, ref: ReactMonacoEditorRef) => {
  const monacoRef = React.useRef<Monaco | null>(null)

  React.useEffect(() => {
    const remeasureFonts = () => {
      monacoRef?.current?.editor?.remeasureFonts()
    }

    // TODO: font name should be a global (for all)
    const loaded = (document as any).fonts?.check?.('1em Roboto Mono')

    if (loaded) {
      remeasureFonts()
    } else {
      ;(document as any).fonts?.ready?.then?.(remeasureFonts)
    }
  }, [])

  const editorWillMount: DiffEditorWillMount = monaco => {
    monacoRef.current = monaco
    monaco?.editor?.defineTheme('disable-theme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#f3f3fa'
      }
    })
  }

  const theme = props.options?.readOnly ? 'disable-theme' : 'vs'

  return <ReactMonacoDiffEditor {...props} ref={ref} theme={theme} editorWillMount={editorWillMount} />
}

export default React.forwardRef(MonacoDiffEditor)
