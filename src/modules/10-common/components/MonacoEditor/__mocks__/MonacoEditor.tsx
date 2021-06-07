import React from 'react'
import type { MonacoEditorProps } from 'react-monaco-editor'

export default function MonacoEditor(
  props: MonacoEditorProps & { name: string; value?: string; 'data-testid'?: string }
) {
  return (
    <textarea
      name={props.name}
      value={props.value}
      data-testid={props['data-testid']}
      onChange={e => props.onChange?.(e.target.value, e as any)}
    />
  )
}
