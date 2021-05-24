import React from 'react'
import type { MonacoEditorProps } from 'react-monaco-editor'

export default function MonacoEditor(props: MonacoEditorProps & { name: string }) {
  return <textarea name={props.name} onChange={e => props.onChange?.(e.target.value, e as any)} />
}
