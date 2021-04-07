import React, { useEffect, useState } from 'react'
import { Drawer, IDrawerProps, Classes } from '@blueprintjs/core'
import { get } from 'lodash-es'
import cx from 'classnames'
import { MonacoDiffEditor } from 'react-monaco-editor'
import { stringify } from 'yaml'
import { Layout, Container, Text, Color, Button, useToggle } from '@wings-software/uicore'
import {
  CF_LOCAL_STORAGE_ENV_KEY,
  DEFAULT_ENV,
  AuditLogAction,
  formatDate,
  formatTime,
  ADIT_LOG_EMPTY_ENTRY_ID,
  getErrorMessage
} from '@cf/utils/CFUtils'
import { useLocalStorage } from '@common/hooks'
import { PageError } from '@common/components/Page/PageError'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useAppStore, useStrings } from 'framework/exports'
import { AuditTrail, Feature, useGetOSById } from 'services/cf'
import css from './EventSummary.module.scss'

const drawerStates: IDrawerProps = {
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  hasBackdrop: true,
  usePortal: true,
  isOpen: true,
  size: 790,
  backdropClassName: css.backdrop,
  className: css.container
}

const DIFF_VIEWER_OPTIONS = {
  ignoreTrimWhitespace: true,
  minimap: { enabled: false },
  codeLens: false,
  readOnly: true,
  renderSideBySide: false,
  lineNumbers: 'off' as 'off',
  inDiffEditor: true,
  scrollBeyondLastLine: false,
  smartSelect: false
}

export interface EventSummaryProps {
  flagData: Feature
  data: AuditTrail
  onClose: () => void
}

export const EventSummary: React.FC<EventSummaryProps> = ({ data, flagData, onClose }) => {
  const { getString } = useStrings()
  const [environment] = useLocalStorage(CF_LOCAL_STORAGE_ENV_KEY, DEFAULT_ENV)
  const { selectedProject } = useAppStore()
  let text = getString('cf.auditLogs.createdMessageFF')
  const [showDiff, toggleShowDiff] = useToggle(true)
  const { objectBefore, objectAfter } = data
  const isNewObject = objectBefore === ADIT_LOG_EMPTY_ENTRY_ID
  const { data: diffData, loading, error, refetch } = useGetOSById({
    identifiers: isNewObject ? [objectAfter] : [objectBefore, objectAfter],
    lazy: !showDiff
  })

  switch (data.action) {
    case AuditLogAction.SegmentCreated:
      text = getString('cf.auditLogs.createdMessageSegment')
      break
    case AuditLogAction.FeatureActivationPatched:
      text = getString('cf.auditLogs.createdMessageFFUpdate')
      break
  }
  const date = `${formatDate(data.executedOn)}, ${formatTime(data.executedOn)} PST`
  const [valueBefore, setValueBefore] = useState<string | undefined>()
  const [valueAfter, setValueAfter] = useState<string | undefined>()

  useEffect(() => {
    const _before = isNewObject ? undefined : get(diffData, 'data.objectsnapshots[0].value')
    const _after = get(diffData, `data.objectsnapshots[${isNewObject ? 0 : 1}].value`)

    if (_before) {
      setValueBefore(stringify(_before))
    }
    if (_after) {
      setValueAfter(stringify(_after))
    }
  }, [diffData])

  return (
    <Drawer
      className={css.container}
      {...drawerStates}
      onClose={onClose}
      title={<header>{getString('cf.auditLogs.eventSummary')}</header>}
    >
      <Container className={cx(Classes.DRAWER_BODY, css.body)} padding="xlarge">
        <Container className={css.eventSection} padding="large">
          <Layout.Vertical spacing="medium">
            <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#9293AB' }}>{date}</Text>
            <Text color={Color.GREY_400}>
              {getString('cf.auditLogs.moduleFF')} | Project: {selectedProject?.name} | Environment:{' '}
              {environment?.label}
            </Text>
          </Layout.Vertical>
          <Container style={{ marginTop: 'var(--spacing-xxlarge)' }}>
            <Text icon="person" iconProps={{ size: 16 }}>
              <strong>{data.actor}</strong>
              <span style={{ padding: '0 var(--spacing-xsmall)' }}>{text}</span>
              <strong>{flagData.name}</strong>
            </Text>
          </Container>
          <Container margin={{ top: 'large', left: 'small' }}>
            <Button
              minimal
              rightIcon={showDiff ? 'chevron-up' : 'chevron-down'}
              text={getString('cf.auditLogs.yamlDifference').toLocaleUpperCase()}
              onClick={() => {
                toggleShowDiff()
                refetch()
              }}
            />
            {showDiff && (
              <Container margin={{ top: 'xsmall', left: 'small', right: 'small' }} height={480}>
                {!!diffData && (
                  <MonacoDiffEditor
                    width="670"
                    height="480"
                    language="javascript"
                    original={valueBefore}
                    value={valueAfter}
                    options={DIFF_VIEWER_OPTIONS}
                  />
                )}

                {error && (
                  <PageError
                    message={getErrorMessage(error)}
                    onClick={() => {
                      refetch()
                    }}
                  />
                )}

                {loading && (
                  <Container
                    style={{
                      position: 'fixed',
                      top: '240px',
                      right: '29px',
                      width: '733px',
                      height: '507px'
                    }}
                  >
                    <ContainerSpinner />
                  </Container>
                )}
              </Container>
            )}
          </Container>
        </Container>
      </Container>
    </Drawer>
  )
}
