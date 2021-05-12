import React from 'react'
import type { MonacoEditorProps } from 'react-monaco-editor'
import { Dialog, Classes } from '@blueprintjs/core'
import { FormikProps, connect } from 'formik'
import { get } from 'lodash-es'
import { Button } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'

import css from './TFMonaco.module.scss'

export type ScriptType = 'Bash' | 'PowerShell'

export interface ShellScriptMonacoProps {
  scriptType: ScriptType
  name: string
  disabled?: boolean
}

export interface TFMonacoProps {
  formik: FormikProps<unknown>
  name: string
}

export function TFBackendConfigMonaco(props: TFMonacoProps): React.ReactElement {
  const [isFullScreen, setFullScreen] = React.useState(false)
  const { getString } = useStrings()
  const value = get(props.formik.values, props.name) || ''

  const monaco = (
    <div className={css.monacoWrapper}>
      {isFullScreen ? null : (
        <Button
          className={css.expandBtn}
          icon="fullscreen"
          small
          onClick={() => setFullScreen(true)}
          iconProps={{ size: 10 }}
        />
      )}
      <MonacoEditor
        height={isFullScreen ? '70vh' : 300}
        value={value}
        language="json"
        options={
          {
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 13,
            minimap: {
              enabled: false
            },
            scrollBeyondLastLine: false
          } as MonacoEditorProps['options']
        }
        onChange={txt => props.formik.setFieldValue(props.name, txt)}
      />
    </div>
  )
  return (
    <React.Fragment>
      {isFullScreen ? <div className={css.monacoWrapper} /> : monaco}
      <Dialog
        lazy
        isOpen={isFullScreen}
        isCloseButtonShown
        canOutsideClickClose={false}
        onClose={() => setFullScreen(false)}
        title={`${getString('script')}`}
        className={css.monacoDialog}
      >
        <div className={Classes.DIALOG_BODY}>{monaco}</div>
      </Dialog>
    </React.Fragment>
  )
}

export const TFMonaco = connect<TFMonacoProps>(TFBackendConfigMonaco)
