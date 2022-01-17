/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
