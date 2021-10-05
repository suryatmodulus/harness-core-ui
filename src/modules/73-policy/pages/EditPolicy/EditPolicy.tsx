import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MonacoEditor from 'react-monaco-editor'
import SplitPane from 'react-split-pane'
import cx from 'classnames'
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
import { Intent } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router'
import { showToaster, getErrorMessage } from '@policy/utils/PmUtils'
import routes from '@common/RouteDefinitions'
import { PageHeader } from '@common/components/Page/PageHeader'
import { Page } from '@common/exports'
import { REGO_FORMAT } from '@policy/utils/rego'
import { useCreatePolicy, useEvaluateRaw, useGetPolicy, useUpdatePolicy } from 'services/pm'
import css from './EditPolicy.module.scss'

const editorOptions = {
  ignoreTrimWhitespace: true,
  minimap: { enabled: false },
  codeLens: false,
  scrollBeyondLastLine: false,
  smartSelect: false,
  tabSize: 2,
  insertSpaces: true
}

const EDITOR_GAP = 25
const PAGE_PADDING = 50

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
  const [regoEditor, setRegoEditor] = useState<EDITOR.IStandaloneCodeEditor>()
  const [inputEditor, setInputEditor] = useState<EDITOR.IStandaloneCodeEditor>()
  const [outputEditor, setOutputEditor] = useState<EDITOR.IStandaloneCodeEditor>()
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
        showToaster(getErrorMessage(error), { intent: Intent.DANGER })
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
      .finally(() => setTestPolicyLoading(false))
  }, [evaluateRawPolicy, regoScript, input])
  const { data: policyData, refetch: fetchPolicyData } = useGetPolicy({ policy: policyIdentifier, lazy: true })
  const [loadingPolicy, setLoadingPolicy] = useState(false)
  const scriptContainerRef = useRef<HTMLDivElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const outputContainerRef = useRef<HTMLDivElement>(null)

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
        {/* BUG: somehow dynamically showing loading is not working, workaround below */}
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
  const relayoutEditors = useCallback(() => {
    if (scriptContainerRef.current) {
      regoEditor?.layout({
        width: (scriptContainerRef.current?.parentNode as HTMLDivElement)?.offsetWidth - EDITOR_GAP,
        height: (scriptContainerRef.current?.parentNode as HTMLDivElement)?.offsetHeight - PAGE_PADDING
      })
      inputEditor?.layout({
        width: (inputContainerRef.current as HTMLDivElement)?.offsetWidth,
        height: (inputContainerRef.current as HTMLDivElement)?.offsetHeight
      })
      outputEditor?.layout({
        width: (outputContainerRef.current as HTMLDivElement)?.offsetWidth,
        height: (outputContainerRef.current as HTMLDivElement)?.offsetHeight
      })
    }
  }, [regoEditor, inputEditor, outputEditor])

  useEffect(() => {
    window.addEventListener('resize', relayoutEditors)
    relayoutEditors()

    return () => {
      window.removeEventListener('resize', relayoutEditors)
    }
  }, [relayoutEditors])

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

      if (regoEditor) {
        regoEditor.focus()
        setTimeout(() => {
          regoEditor.setSelection(new monaco.Selection(0, 0, 0, 0))
        }, 0)
      }
    }
  }, [policyData, regoEditor])

  return (
    <>
      <PageHeader title={<Layout.Horizontal>{policyNameEditor()}</Layout.Horizontal>} toolbar={toolbar} />
      <Page.Body loading={loadingPolicy}>
        <Container className={css.container}>
          <SplitPane
            split="vertical"
            defaultSize="60%"
            minSize={400}
            maxSize={-300}
            onChange={relayoutEditors}
            resizerStyle={{ width: '25px', background: 'none', borderLeft: 'none', borderRight: 'none' }}
            pane2Style={{ margin: 'var(--spacing-xlarge) var(--spacing-xlarge) var(--spacing-xlarge) 0' }}
          >
            <Container ref={scriptContainerRef} className={cx(css.module, css.regoContainer)}>
              <MonacoEditor
                language="rego"
                theme="vs-light"
                value={regoScript}
                options={editorOptions}
                onChange={newValue => {
                  setRegoScript(newValue)
                }}
                editorWillMount={monaco => {
                  // Registering new language
                  monaco.languages.register({ id: 'rego' })

                  // Registering rego language tokens
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ;(monaco.languages.setMonarchTokensProvider as (name: string, format: any) => void)(
                    'rego',
                    REGO_FORMAT
                  )
                }}
                editorDidMount={_editor => {
                  setRegoEditor(_editor)
                }}
              />
            </Container>
            <SplitPane
              split="horizontal"
              defaultSize="50%"
              minSize={100}
              maxSize={-100}
              onChange={relayoutEditors}
              resizerStyle={{ height: '25px', background: 'none', borderTop: 'none', borderBottom: 'none' }}
              pane2Style={{ overflow: 'hidden', flexShrink: 'unset' }}
            >
              <Container className={cx(css.module, css.inputContainer)}>
                <Layout.Vertical style={{ height: '100%' }}>
                  <Container padding="medium" flex className={css.inputHeader}>
                    <Text color={Color.WHITE}>Input</Text>
                    <FlexExpander />
                    <Layout.Horizontal spacing="small">
                      <Button
                        variation={ButtonVariation.ICON}
                        icon="code"
                        size={ButtonSize.SMALL}
                        onClick={() => {
                          try {
                            setInput(JSON.stringify(JSON.parse(input), null, 2))
                          } catch (e) {
                            showToaster(getErrorMessage(e), { intent: Intent.DANGER })
                          }
                        }}
                      />
                      <Button variation={ButtonVariation.SECONDARY} size={ButtonSize.SMALL} text="Select Input" />
                    </Layout.Horizontal>
                  </Container>
                  <Container flex className={css.ioEditor} ref={inputContainerRef}>
                    <MonacoEditor
                      language="json"
                      theme="vs-light"
                      value={input}
                      options={editorOptions}
                      onChange={newValue => {
                        setInput(newValue)
                      }}
                      editorDidMount={setInputEditor}
                    />
                  </Container>
                </Layout.Vertical>
              </Container>
              <Container className={cx(css.module, css.outputContainer)}>
                <Layout.Vertical style={{ height: '100%' }}>
                  <Container padding="medium" flex className={css.inputHeader}>
                    <Text color={Color.WHITE}>Output</Text>
                    <FlexExpander />
                  </Container>
                  <Container flex className={css.ioEditor} ref={outputContainerRef}>
                    <MonacoEditor
                      language="json"
                      theme="vs-light"
                      value={output}
                      options={{ ...editorOptions, readOnly: true }}
                      onChange={newValue => {
                        setOutput(newValue)
                      }}
                      editorDidMount={setOutputEditor}
                    />
                  </Container>
                </Layout.Vertical>
              </Container>
            </SplitPane>
          </SplitPane>
        </Container>
      </Page.Body>
    </>
  )
}

// TODO:
// 1- Error handling
// 2- Adjust height of editor/textarea when resize happens
// 3- Prompt for policy name if it's not entered, default it to `Untitled Policy`
