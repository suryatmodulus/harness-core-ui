import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MonacoEditor from 'react-monaco-editor'
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
import routes from '@common/RouteDefinitions'
import { PageHeader } from '@common/components/Page/PageHeader'
import { Page } from '@common/exports'
import { REGO_FORMAT } from '@policy/utils/rego'
import { useCreatePolicy, useEvaluateRaw } from 'services/pm'
import css from './NewPolicy.module.scss'

const RIGHT_CONTAINER_WIDTH = 380

const editorOptions = {
  ignoreTrimWhitespace: true,
  minimap: { enabled: false },
  codeLens: false,
  scrollBeyondLastLine: false,
  smartSelect: false
}

const NewPolicy: React.FC = () => {
  const [name, setName] = useState('My Policy 1')
  const [regoScript, setRegoScript] = useState('')
  const [input, setInput] = useState('')
  const [output] = useState('')
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
  const history = useHistory()
  const onSavePolicy = useCallback(() => {
    setCreatePolicyLoading(true)
    createPolicy({ name, rego: regoScript })
      .then(() => {
        history.replace(routes.toPolicyListPage({ accountId }))
      })
      .catch(error => {
        setCreatePolicyLoading(false)
        // TODO: Show error
        console.log({ error })
      })
  }, [name, regoScript, createPolicy, setCreatePolicyLoading, accountId, history])
  const onTest = useCallback(() => {
    evaluateRawPolicy('{}', { queryParams: { rego: 'public = true' } })
      .then(_response => console.log(_response))
      .catch(error => console.error(error))
  }, [evaluateRawPolicy])
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

  return (
    <>
      <PageHeader
        title={<Layout.Horizontal>{policyNameEditor()}</Layout.Horizontal>}
        toolbar={
          <Layout.Horizontal spacing="small">
            <Button
              icon="upload-box"
              variation={ButtonVariation.SECONDARY}
              size={ButtonSize.SMALL}
              text="Save"
              onClick={onSavePolicy}
              disabled={!(regoScript || '').trim()}
              loading={createPolicyLoading}
            />
            <Button
              variation={ButtonVariation.SECONDARY}
              size={ButtonSize.SMALL}
              text="Discard"
              onClick={() => {
                history.push(routes.toPolicyListPage({ accountId }))
              }}
            />
            <Button
              icon="run-pipeline"
              variation={ButtonVariation.PRIMARY}
              text="Test"
              intent="success"
              size={ButtonSize.SMALL}
              disabled={!isInputValid}
              onClick={onTest}
            />
          </Layout.Horizontal>
        }
      />
      <Page.Body>
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
                editorDidMount={editor => {
                  editor.focus()
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
                          } finally {
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

export default NewPolicy

// TODO:
// 1- Error handling
// 2- Adjust height of editor/textarea when resize happens
// 3- Prompt for policy name if it's not entered, default it to `Untitled Policy`
