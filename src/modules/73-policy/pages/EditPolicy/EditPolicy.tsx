import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MonacoEditor from 'react-monaco-editor'
import type { editor as EDITOR } from 'monaco-editor/esm/vs/editor/editor.api'
import {
  ButtonVariation,
  Layout,
  Button,
  Container,
  Color,
  Text,
  FontVariation,
  TextInput,
  ButtonSize,
  FlexExpander
} from '@wings-software/uicore'
import { TextArea } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router'
import { showToaster, getErrorMessage } from '@policy/utils/PmUtils'
import routes from '@common/RouteDefinitions'
import { PageHeader } from '@common/components/Page/PageHeader'
import { Page } from '@common/exports'
import { REGO_FORMAT } from '@policy/utils/rego'
import { useCreatePolicy, useEvaluateRaw, useGetPolicy, useUpdatePolicy } from 'services/pm'
import css from './EditPolicy.module.scss'

const RIGHT_CONTAINER_WIDTH = 550

const editorOptions = {
  ignoreTrimWhitespace: true,
  minimap: { enabled: false },
  codeLens: false,
  scrollBeyondLastLine: false,
  smartSelect: false,
  tabSize: 2,
  insertSpaces: true
}

export const EditPolicy: React.FC = () => {
  const { policyIdentifier } = useParams<{ policyIdentifier: string }>()
  const [name, setName] = useState(policyIdentifier ? '' : 'My Policy 1')
  const [regoScript, setRegoScript] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [editName, setEditName] = useState(false)
  const isInputValid = useMemo(() => {
    if (!(input || '').trim() || !(regoScript || '').trim()) {
      return false
    }

    try {
      JSON.parse(input)
      return true
    } catch (error) {
      return false
    }
  }, [input, regoScript])
  const { mutate: createPolicy } = useCreatePolicy({})
  const { mutate: evaluateRawPolicy } = useEvaluateRaw({})
  const { accountId } = useParams<{ accountId: string }>()
  const [createPolicyLoading, setCreatePolicyLoading] = useState(false)
  const [testPolicyLoading, setTestPolicyLoading] = useState(false)
  const [editor, setEditor] = useState<EDITOR.IStandaloneCodeEditor>()
  const history = useHistory()
  const { mutate: updatePolicy } = useUpdatePolicy({ policy: policyIdentifier })
  const onSavePolicy = useCallback(() => {
    setCreatePolicyLoading(true)
    const api = policyIdentifier ? updatePolicy : createPolicy
    api({ name, rego: regoScript })
      .then(response => {
        showToaster('Policy saved!')
        if (!policyIdentifier) {
          history.replace(routes.toPolicyEditPage({ accountId, policyIdentifier: String(response.id || '') }))
        }
      })
      .catch(error => {
        showToaster(getErrorMessage(error))
      })
      .finally(() => {
        setCreatePolicyLoading(false)
      })
  }, [name, regoScript, createPolicy, setCreatePolicyLoading, updatePolicy, policyIdentifier, history, accountId])
  const onTest = useCallback(() => {
    setTestPolicyLoading(true)
    evaluateRawPolicy({ rego: regoScript, input: JSON.parse(input) })
      .then(response => {
        try {
          const _response = typeof response === 'string' ? JSON.parse(response) : response
          setOutput(JSON.stringify(_response, null, 2))
        } catch {
          // eslint-disable-line no-empty
        }
      })
      .catch(error => showToaster(getErrorMessage(error)))
      .finally(() => {
        setTestPolicyLoading(false)
      })
  }, [evaluateRawPolicy, regoScript, input])
  const { data: policyData, refetch: fetchPolicyData } = useGetPolicy({ policy: policyIdentifier, lazy: true })
  const [loadingPolicy, setLoadingPolicy] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)
  const [contentWidth, setContentWidth] = useState(0)

  const policyNameEditor = (): JSX.Element => {
    return (
      <Layout.Horizontal spacing="xsmall">
        <Text
          font={{ variation: FontVariation.H6 }}
          icon="chained-pipeline"
          iconProps={{ style: { paddingRight: 'var(--spacing-small)' } }}
          className={css.policyNameInputContainer}
        >
          {(!editName && name) || ''}
          {editName && (
            <TextInput
              value={name}
              placeholder={'My Policy 1'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              onBlur={() => {
                setEditName(false)
              }}
              onKeyUp={event => {
                if (event.key === 'Enter') {
                  setEditName(false)
                }
              }}
              autoFocus
            />
          )}
        </Text>
        {!editName && (
          <Button
            icon="Edit"
            variation={ButtonVariation.ICON}
            onClick={() => {
              setEditName(true)
            }}
          />
        )}
      </Layout.Horizontal>
    )
  }
  const toolbar = useMemo(() => {
    return (
      <Layout.Horizontal spacing="small">
        {!createPolicyLoading && (
          <Button
            icon="upload-box"
            variation={ButtonVariation.SECONDARY}
            size={ButtonSize.SMALL}
            text="Save"
            onClick={onSavePolicy}
            disabled={!(regoScript || '').trim()}
            loading={createPolicyLoading}
          />
        )}
        {createPolicyLoading && (
          <Button icon="upload-box" variation={ButtonVariation.SECONDARY} size={ButtonSize.SMALL} text="Save" loading />
        )}
        <Button
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          text="Discard"
          onClick={() => {
            history.push(routes.toPolicyListPage({ accountId }))
          }}
        />
        {!testPolicyLoading && (
          <Button
            icon="run-pipeline"
            variation={ButtonVariation.PRIMARY}
            text={'Test'}
            intent="success"
            size={ButtonSize.SMALL}
            disabled={!isInputValid}
            onClick={onTest}
            // BUG: dynamic loading is not working, workaround below
            loading={testPolicyLoading}
          />
        )}
        {testPolicyLoading && (
          <Button
            icon="run-pipeline"
            variation={ButtonVariation.PRIMARY}
            text={'Test'}
            intent="success"
            size={ButtonSize.SMALL}
            loading
          />
        )}
      </Layout.Horizontal>
    )
  }, [history, testPolicyLoading, accountId, createPolicyLoading, isInputValid, onSavePolicy, onTest, regoScript])

  const onResize = (): void => {
    if (ref.current) {
      setContentHeight((ref.current as HTMLDivElement)?.offsetHeight)
      setContentWidth((ref.current as HTMLDivElement)?.offsetWidth - RIGHT_CONTAINER_WIDTH)
    }
  }

  useEffect(() => {
    onResize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    if (policyIdentifier) {
      setLoadingPolicy(true)
      fetchPolicyData().finally(() => {
        setLoadingPolicy(false)
      })
    }
  }, [policyIdentifier, fetchPolicyData])

  useEffect(() => {
    if (policyData) {
      setRegoScript(policyData.rego || '')
      setName(policyData.name || '')

      if (editor) {
        editor.focus()
        setTimeout(() => {
          editor.setSelection(new monaco.Selection(0, 0, 0, 0))
        }, 0)
      }
    }
  }, [policyData, editor])

  return (
    <>
      <PageHeader title={<Layout.Horizontal>{policyNameEditor()}</Layout.Horizontal>} toolbar={toolbar} />
      <Page.Body loading={loadingPolicy}>
        <Container className={css.container} padding="medium">
          <Text className={css.regoLabel}>Rego Script</Text>
          <Layout.Horizontal spacing="small" className={css.layout} ref={ref}>
            <Container className={css.leftContainer}>
              <MonacoEditor
                width={`${contentWidth}px`}
                height={`${contentHeight}px`}
                language="rego"
                theme="vs-dark"
                value={regoScript}
                options={editorOptions}
                onChange={newValue => {
                  setRegoScript(newValue)
                }}
                editorWillMount={monaco => {
                  monaco.languages.register({ id: 'rego' })
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ;(monaco.languages.setMonarchTokensProvider as (name: string, format: any) => void)(
                    'rego',
                    REGO_FORMAT
                  )

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  // ;(monaco.editor.defineTheme as (name: string, theme: any) => void)('rego-dark', REGO_THEME)
                }}
                editorDidMount={_editor => {
                  setEditor(_editor)
                }}
              />
            </Container>

            <Container className={css.rightContainer}>
              <Layout.Vertical spacing="medium" style={{ height: '100%' }}>
                <Container style={{ height: '50%' }}>
                  <Layout.Vertical style={{ height: '100%' }}>
                    <Container padding="medium" flex className={css.inputHeader}>
                      <Text color={Color.WHITE}>Input</Text>
                      <FlexExpander />
                      <Button variation={ButtonVariation.SECONDARY} size={ButtonSize.SMALL} text="Select Input" />
                    </Container>
                    <Container flex className={css.inputValue}>
                      <TextArea
                        large={true}
                        onInput={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                          setInput(event.target.value)
                        }}
                        value={input}
                        fill
                        onBlur={() => {
                          try {
                            setInput(JSON.stringify(JSON.parse(input), null, 2))
                          } catch {
                            // eslint-disable-line no-empty
                          }
                        }}
                        style={{ height: '100%' }}
                      />
                    </Container>
                  </Layout.Vertical>
                </Container>

                <Container style={{ height: '50%' }}>
                  <Layout.Vertical style={{ height: '100%' }}>
                    <Container padding="medium" flex className={css.inputHeader}>
                      <Text color={Color.WHITE}>Output</Text>
                    </Container>
                    <Container flex className={css.inputValue}>
                      <TextArea large={true} readOnly value={output} fill style={{ height: '100%' }} />
                    </Container>
                  </Layout.Vertical>
                </Container>
              </Layout.Vertical>
            </Container>
          </Layout.Horizontal>
        </Container>
      </Page.Body>
    </>
  )
}

// TODO:
// 1- Error handling
// 2- Adjust height of editor/textarea when resize happens
// 3- Prompt for policy name if it's not entered, default it to `Untitled Policy`
