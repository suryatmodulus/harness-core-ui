import React, { useEffect, useState } from 'react'
import { stringify } from 'yaml'
import { isEmpty } from 'lodash-es'
import { Link } from 'react-router-dom'
import { PopoverInteractionKind, Position, ProgressBar } from '@blueprintjs/core'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { Accordion, Button, Color, Container, Layout, Popover, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import type { NgPipeline } from 'services/cd-ng'
import {
  ConnectorCheckResponse,
  PipelineInputResponse,
  PreFlightDTO,
  PreFlightEntityErrorInfo,
  ResponsePreFlightDTO,
  startPreflightCheckPromise,
  useGetPreflightCheckResponse
} from 'services/pipeline-ng'
import type { Module } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

import css from './PreFlightCheckModal.module.scss'

enum Section {
  CONNECTORS = 'CONNECTORS',
  INPUT_SET = 'INPUT_SET'
}

const getIconProps = (status?: string): IconProps => {
  if (status === 'SUCCESS') {
    return { color: Color.GREEN_500, name: 'small-tick' }
  } else if (status === 'IN_PROGRESS') {
    return { color: Color.GREY_400, name: 'pending', className: css.spinningIcon }
  } else if (status === 'FAILURE') {
    return { color: Color.RED_500, name: 'small-cross' }
  }
  return { color: Color.GREY_400, name: 'pending', className: css.spinningIcon }
}

const getStatusMessage = (status?: string): string => {
  if (status === 'SUCCESS') {
    return 'success'
  } else if (status === 'IN_PROGRESS') {
    return 'in progress'
  } else if (status === 'FAILURE') {
    return 'failure'
  }
  return 'unknown'
}

const RowStatus: React.FC<{ status: ConnectorCheckResponse['status'] }> = ({ status }) => {
  return (
    <Text inline icon="dot" iconProps={{ color: getIconProps(status).color }}>
      {getStatusMessage(status)}
    </Text>
  )
}

interface SectionLabelsProps {
  selectedSection: Section
  setSelectedSection: (section: Section) => void
  preFlightCheckData?: PreFlightDTO
}

const SectionLabels: React.FC<SectionLabelsProps> = ({ selectedSection, setSelectedSection, preFlightCheckData }) => {
  const { getString } = useStrings()

  const inputSetStatus = preFlightCheckData?.pipelineInputWrapperResponse?.status
  const inputSetLabel = getString('pre-flight-check.verifyingPipelineInputs')

  const connectorStatus = preFlightCheckData?.connectorWrapperResponse?.status
  const connectorLabel = getString('pre-flight-check.verifyingConnectors')

  const inputSetIconProps = getIconProps(inputSetStatus)
  const connectorsIconProps = getIconProps(connectorStatus)

  return (
    <Layout.Vertical spacing="xlarge" className={css.sectionLabelsWrapper}>
      <Text
        inline
        font={{ weight: selectedSection === Section.INPUT_SET ? 'bold' : 'light' }}
        iconProps={inputSetIconProps}
        icon={inputSetIconProps.name}
        className={css.sectionLabelText}
        onClick={() => setSelectedSection(Section.INPUT_SET)}
      >
        {inputSetLabel}
      </Text>
      <Text
        inline
        font={{ weight: selectedSection === Section.CONNECTORS ? 'bold' : 'light' }}
        iconProps={connectorsIconProps}
        icon={connectorsIconProps.name}
        className={css.sectionLabelText}
        onClick={() => setSelectedSection(Section.CONNECTORS)}
      >
        {connectorLabel}
      </Text>
    </Layout.Vertical>
  )
}

interface ErrorPanelProps {
  errorInfo?: PreFlightEntityErrorInfo
}

const ErrorPanel: React.FC<ErrorPanelProps> = ({ errorInfo }) => {
  const { getString } = useStrings()

  return (
    <Container className={css.errorPanel}>
      <h3>{getString('errorSummaryText')}</h3>
      <Container margin={{ bottom: 'medium' }}>
        <Text>{errorInfo?.summary}</Text>
        <Text>{errorInfo?.description}</Text>
      </Container>
      {errorInfo?.causes && errorInfo?.causes.length > 0 && (
        <Container margin={{ bottom: 'medium' }}>
          <Text>{getString('pre-flight-check.possibleCauses')}</Text>
          {errorInfo?.causes?.map((cause, idx) => (
            <Text key={idx}>{cause.cause}</Text>
          ))}
        </Container>
      )}
      {errorInfo?.resolution && errorInfo?.resolution?.length > 0 && (
        <Container margin={{ bottom: 'medium' }}>
          <Text>{getString('pre-flight-check.resolution')}</Text>
          {errorInfo?.resolution?.map((res, idx) => (
            <Text key={idx}>{res.resolution}</Text>
          ))}
        </Container>
      )}
    </Container>
  )
}

interface ConnectorsSectionProps {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  pipelineIdentifier: string
  module: Module
  preFlightCheckData?: PreFlightDTO
}

const ConnectorsSection: React.FC<ConnectorsSectionProps> = ({
  accountId,
  orgIdentifier,
  projectIdentifier,
  pipelineIdentifier,
  module,
  preFlightCheckData
}) => {
  const { getString } = useStrings()

  const data = preFlightCheckData?.connectorWrapperResponse?.checkResponses
  const status = preFlightCheckData?.connectorWrapperResponse?.status

  if (status === 'IN_PROGRESS' && isEmpty(data)) {
    return <Text>{getString('pre-flight-check.gettingConnectorResult')}</Text>
  }
  if (status === 'SUCCESS' && isEmpty(data)) {
    // No connectors to verify
    return <Text intent="success">{getString('success')}</Text>
  }
  if (status === 'FAILURE' && isEmpty(data)) {
    // No connectors to verify
    return <Text intent="danger">{getString('pre-flight-check.couldNotVerifyConnectors')}</Text>
  }

  const getDetails = (row: ConnectorCheckResponse) => (
    <Layout.Horizontal spacing="large" key={row.fqn}>
      <Text className={css.connectorName}>{row.connectorIdentifier}</Text>
      <span className={css.connectorId}>
        {getString('idLabel')}
        <Popover
          boundary={'window'}
          position={Position.TOP}
          interactionKind={PopoverInteractionKind.HOVER}
          portalClassName={css.locationPopover}
          modifiers={{ preventOverflow: { enabled: false } }}
        >
          <Link
            target={'_blank'}
            to={`${routes.toPipelineStudio({
              accountId,
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier,
              module
            })}?stage=${(row as any).stageIdentifier}&step=${(row as any).stepIdentifier}`}
          >
            {row.connectorIdentifier}
          </Link>
          <Container className={css.locationPopoverContent}>
            <Text className={css.row}>{getString('pre-flight-check.connectorLocationInPipeline')}</Text>
            {row.stageName && (
              <Text className={css.row}>
                <strong>{getString('pre-flight-check.stageColon')}</strong> {row.stageName}
              </Text>
            )}
            {row.stepName && (
              <Text className={css.row}>
                <strong>{getString('pre-flight-check.stepColon')}</strong> {row.stepName}
              </Text>
            )}
          </Container>
        </Popover>
      </span>
      <RowStatus status={row.status} />
    </Layout.Horizontal>
  )

  return (
    <Layout.Vertical spacing="large">
      {data?.map(row => {
        return row.status === 'FAILURE' ? (
          <Accordion>
            <Accordion.Panel
              id={row.connectorIdentifier || ''}
              details={<ErrorPanel errorInfo={row.errorInfo} />}
              summary={getDetails(row)}
            ></Accordion.Panel>
          </Accordion>
        ) : (
          getDetails(row)
        )
      })}
    </Layout.Vertical>
  )
}

interface InputSetsSectionProps {
  preFlightCheckData?: PreFlightDTO
}

const InputSetsSection: React.FC<InputSetsSectionProps> = ({ preFlightCheckData }) => {
  const { getString } = useStrings()

  const data = preFlightCheckData?.pipelineInputWrapperResponse?.pipelineInputResponse
  const status = preFlightCheckData?.pipelineInputWrapperResponse?.status

  if (status === 'IN_PROGRESS' && isEmpty(data)) {
    return <Text>{getString('pre-flight-check.gettingResults')}</Text>
  }
  if (status === 'SUCCESS' && isEmpty(data)) {
    // No connectors to verify
    return <Text intent="success">{getString('success')}</Text>
  }
  if (status === 'FAILURE' && isEmpty(data)) {
    // No connectors to verify
    return <Text intent="danger">{getString('pre-flight-check.couldNotVerifyInputSets')}</Text>
  }

  const getDetails = (row: PipelineInputResponse) => (
    <Layout.Horizontal spacing="large" key={row.fqn}>
      <Text className={css.inputFqn} lineClamp={1}>
        {row.fqn}
      </Text>
      <RowStatus status={row.success ? 'SUCCESS' : 'FAILURE'} />
    </Layout.Horizontal>
  )

  return (
    <Layout.Vertical spacing="large">
      {data?.map(row => {
        return row.success === false ? (
          <Accordion>
            <Accordion.Panel
              id={row.fqn || ''}
              details={<ErrorPanel errorInfo={row.errorInfo} />}
              summary={getDetails(row)}
            ></Accordion.Panel>
          </Accordion>
        ) : (
          getDetails(row)
        )
      })}
    </Layout.Vertical>
  )
}

interface SectionPanelProps {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  pipelineIdentifier: string
  module: Module
  selectedSection: Section
  preFlightCheckData?: PreFlightDTO
}

const SectionPanel: React.FC<SectionPanelProps> = ({
  accountId,
  orgIdentifier,
  projectIdentifier,
  pipelineIdentifier,
  module,
  selectedSection,
  preFlightCheckData
}) => {
  return (
    <div className={css.sectionPanelWrapper}>
      {selectedSection === Section.CONNECTORS ? (
        <ConnectorsSection
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          pipelineIdentifier={pipelineIdentifier}
          module={module}
          preFlightCheckData={preFlightCheckData}
        />
      ) : (
        <InputSetsSection preFlightCheckData={preFlightCheckData} />
      )}
    </div>
  )
}

interface PreFlightCheckSectionsProps {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  pipelineIdentifier: string
  module: Module
  preFlightCheckData?: PreFlightDTO
}
const PreFlightCheckSections: React.FC<PreFlightCheckSectionsProps> = ({
  accountId,
  orgIdentifier,
  projectIdentifier,
  pipelineIdentifier,
  module,
  preFlightCheckData
}) => {
  const [selectedSection, setSelectedSection] = useState(Section.INPUT_SET)

  const AUTO_SELECT_STATUSES = ['FAILURE', 'IN_PROGRESS']

  // auto select section
  useEffect(() => {
    if (preFlightCheckData) {
      let selection: Section | undefined = undefined

      if (AUTO_SELECT_STATUSES.indexOf(preFlightCheckData?.pipelineInputWrapperResponse?.status || '') !== -1) {
        selection = Section.INPUT_SET
      }
      if (AUTO_SELECT_STATUSES.indexOf(preFlightCheckData?.connectorWrapperResponse?.status || '') !== -1) {
        selection = Section.CONNECTORS
      }

      if (selection) setSelectedSection(selection)
    }
  }, [preFlightCheckData])

  return (
    <Layout.Horizontal spacing="medium" className={css.sectionsWrapper}>
      <SectionLabels
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        preFlightCheckData={preFlightCheckData}
      />
      <div className={css.divider} />
      <SectionPanel
        accountId={accountId}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
        pipelineIdentifier={pipelineIdentifier}
        module={module}
        selectedSection={selectedSection}
        preFlightCheckData={preFlightCheckData}
      />
    </Layout.Horizontal>
  )
}

interface PreFlightCheckFooter {
  preFlightCheckData?: PreFlightDTO
  onContinuePipelineClick: () => void
  onCloseButtonClick: () => void
  onRetryButtonClick: () => void
}

const PreFlightCheckFooter: React.FC<PreFlightCheckFooter> = ({
  preFlightCheckData,
  onContinuePipelineClick,
  onCloseButtonClick,
  onRetryButtonClick
}) => {
  const { getString } = useStrings()

  // If the check is complete
  if (preFlightCheckData?.status === 'SUCCESS' || preFlightCheckData?.status === 'FAILURE') {
    return (
      <div className={css.footerFailure}>
        <Button intent="primary" text={getString('retry')} onClick={() => onRetryButtonClick()} />
        <Button text={getString('close')} onClick={() => onCloseButtonClick()} />
        <Button
          text={getString('pre-flight-check.continueToRunPipeline')}
          minimal
          intent="primary"
          onClick={() => onContinuePipelineClick()}
        />
      </div>
    )
  }
  return (
    <div className={css.footerInProgress}>
      <Button text={getString('pre-flight-check.skipCheckBtn')} onClick={() => onContinuePipelineClick()} />
      <Text className={css.footerSmallText}>{getString('pre-flight-check.skipCheckInfo')}</Text>
    </div>
  )
}

interface HeadLineProps {
  errorCount: number
}

const HeadLine: React.FC<HeadLineProps> = ({ errorCount }) => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal className={css.headLine}>
      <span className={css.title}>{getString('pre-flight-check.preFlightCheckTitle')}</span>
      {errorCount > 0 ? (
        <span className={css.error}>{getString('pre-flight-check.errorFoundCounter', { errorCount })}</span>
      ) : null}
    </Layout.Horizontal>
  )
}

export const POLL_INTERVAL = 3 /* sec */ * 1000 /* ms */

export interface PreFlightCheckModalProps {
  pipeline?: NgPipeline
  module: Module
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  pipelineIdentifier: string
  onCloseButtonClick: () => void
  onContinuePipelineClick: () => void
}

export const PreFlightCheckModal: React.FC<PreFlightCheckModalProps> = ({
  pipeline,
  module,
  accountId,
  orgIdentifier,
  projectIdentifier,
  pipelineIdentifier,
  onCloseButtonClick,
  onContinuePipelineClick
}) => {
  const [preFlightCheckId, setPreFlightCheckId] = useState<string | undefined>()
  const [preFlightCheckData, setPreFlightCheckData] = useState<ResponsePreFlightDTO | null>()

  // start preflight check
  useEffect(() => {
    if (!preFlightCheckId) {
      startPreflightCheckPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          pipelineIdentifier
        },
        body: !isEmpty(pipeline) ? (stringify({ pipeline }) as any) : ''
      }).then(response => {
        setPreFlightCheckId(response.data)
      })
    }
  }, [pipeline, preFlightCheckId])

  const { data: preFlightCheckResponse, refetch } = useGetPreflightCheckResponse({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      preflightCheckId: preFlightCheckId || ''
    },
    lazy: true
  })

  useEffect(() => {
    setPreFlightCheckData(preFlightCheckResponse)
  }, [preFlightCheckResponse])

  // setting up the polling
  useEffect(() => {
    if (preFlightCheckId) {
      if (!preFlightCheckData || preFlightCheckData?.data?.status === 'IN_PROGRESS') {
        const timerId = window.setTimeout(
          () => {
            refetch()
          },
          !preFlightCheckData ? 1 : POLL_INTERVAL
        )

        return () => {
          window.clearTimeout(timerId)
        }
      }
    }
  }, [preFlightCheckId, preFlightCheckData, refetch])

  // auto close if check pass successfully
  useEffect(() => {
    if (preFlightCheckData?.data?.status === 'SUCCESS') {
      onContinuePipelineClick()
    }
  }, [preFlightCheckData])

  // count total, progress, failed
  const getChecksCount = (preFlight?: PreFlightDTO) => {
    const checkCount = { total: 0, progress: 0, failed: 0 }
    preFlight?.pipelineInputWrapperResponse?.pipelineInputResponse?.forEach(item => {
      checkCount.total++
      if (item.success === false) checkCount.failed++
    })
    preFlight?.connectorWrapperResponse?.checkResponses?.forEach(item => {
      checkCount.total++
      if (item.status === 'IN_PROGRESS') checkCount.progress++
      if (item.status === 'FAILURE') checkCount.failed++
    })

    return checkCount
  }

  const checkCounts = getChecksCount(preFlightCheckData?.data)
  const progressValue = checkCounts.total > 0 ? 1 - (1 / checkCounts.total) * checkCounts.progress : 0

  return (
    <Container className={css.preFlightCheckContainer} padding="medium">
      <HeadLine errorCount={checkCounts.failed} />
      <ProgressBar
        intent={preFlightCheckData?.data?.status === 'FAILURE' ? 'danger' : 'success'}
        value={progressValue}
      />
      <PreFlightCheckSections
        accountId={accountId}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
        pipelineIdentifier={pipelineIdentifier}
        module={module}
        preFlightCheckData={preFlightCheckData?.data}
      />
      <PreFlightCheckFooter
        preFlightCheckData={preFlightCheckData?.data}
        onContinuePipelineClick={onContinuePipelineClick}
        onCloseButtonClick={onCloseButtonClick}
        onRetryButtonClick={() => {
          setPreFlightCheckData(null)
          setPreFlightCheckId(undefined)
        }}
      />
    </Container>
  )
}
