import { ProgressBar } from '@blueprintjs/core'
import css from './PreFlightCheck.module.scss'
import { Link } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { Button, Color, Container, Icon, Layout } from '@wings-software/uicore'
import React, { useEffect, useRef, useState } from 'react'
import { Text } from '@wings-software/uicore'
import { useGetPreFlightCheckResponse } from 'services/pipeline-ng'
import {
  PreFlightCheckModalProps,
  preFlightDummyResponseFailure,
  preFlightDummyResponseProgress,
  preFlightDummyResponseSuccess
} from './PreFlightCheckUtil'
import { isEmpty } from 'lodash-es'
import { accountId } from '@cv/constants'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'

const SECTIONS_DICT = {
  CONNECTORS: 'connectors',
  INPUT_SET: 'INPUT_SET'
}

const getIconProps = (status: string): IconProps => {
  if (status === 'INPROGRESS') {
    return { color: Color.GREY_400, name: 'pending' }
  } else if (status === 'FAILURE') {
    return { color: Color.RED_500, name: 'small-cross' }
  }
  return { color: Color.GREEN_500, name: 'small-tick' }
}

const RowStatus = ({ row }) => {
  return (
    <Text className={css.rowCell} inline icon="dot" iconProps={{ color: getIconProps(row.status).color }}>
      {row.status === 'FAILURE' ? 'failed' : 'success'}
    </Text>
  )
}

const SectionLabels = ({ selectedSection, setSelectedSection, preFlightCheckData }) => {
  const inputSetStatus = preFlightCheckData.pipelineInputWrapperResponse?.status
  const inputSetLabel = preFlightCheckData.pipelineInputWrapperResponse?.label

  const connectorStatus = preFlightCheckData.connectorWrapperResponse?.status
  const connectorLabel = preFlightCheckData.connectorWrapperResponse?.label

  const inputSetIconProps = getIconProps(inputSetStatus)
  const connectorsIconProps = getIconProps(connectorStatus)

  return (
    <Layout.Vertical spacing="xlarge" className={css.sectionLabelsWrapper}>
      <Text
        inline
        font={{ weight: selectedSection === SECTIONS_DICT.INPUT_SET ? 'bold' : 'light' }}
        iconProps={inputSetIconProps}
        icon={inputSetIconProps.name}
        className={css.sectionLabelText}
        onClick={() => setSelectedSection(SECTIONS_DICT.INPUT_SET)}
      >
        {inputSetLabel}
      </Text>
      <Text
        inline
        font={{ weight: selectedSection === SECTIONS_DICT.CONNECTORS ? 'bold' : 'light' }}
        iconProps={connectorsIconProps}
        icon={connectorsIconProps.name}
        className={css.sectionLabelText}
        onClick={() => setSelectedSection(SECTIONS_DICT.CONNECTORS)}
      >
        {connectorLabel}
      </Text>
    </Layout.Vertical>
  )
}

const ConnectorsSection = ({ preFlightCheckData, accountId }) => {
  const data = preFlightCheckData.connectorWrapperResponse?.checkResponses
  const status = preFlightCheckData.connectorWrapperResponse?.status
  if (status === 'INPROGRESS' && isEmpty(data)) {
    return <Text>Getting connector results</Text>
  }
  if (status === 'SUCCESS' && isEmpty(data)) {
    // No conectors to verify
    return <Text intent="success">Success</Text>
  }
  if (status === 'FAILURE' && isEmpty(data)) {
    // No conectors to verify
    return <Text intent="danger">Could not verify conectors</Text>
  }
  return (
    <Layout.Vertical spacing="large">
      {data?.map(row => {
        return (
          <Layout.Horizontal spacing="large" key={row.connectorIdentifier}>
            <Text className={css.rowCell}>{row.connectorName}</Text>
            <span className={css.rowCell}>
              ID: <Link to={routes.toProjects({ accountId })}>{row.connectorIdentifier}</Link>
            </span>
            <RowStatus row={row} />
          </Layout.Horizontal>
        )
      })}
    </Layout.Vertical>
  )
}

const InputSetsSection = ({ preFlightCheckData }) => {
  const data = preFlightCheckData.pipelineInputWrapperResponse?.pipelineInputResponse
  const status = preFlightCheckData.pipelineInputWrapperResponse?.status
  if (status === 'INPROGRESS' && isEmpty(data)) {
    return <Text>Getting results</Text>
  }
  if (status === 'SUCCESS' && isEmpty(data)) {
    // No conectors to verify
    return <Text intent="success">Success</Text>
  }
  if (status === 'FAILURE' && isEmpty(data)) {
    // No conectors to verify
    return <Text intent="danger">Could not verify input sets</Text>
  }
  return (
    <Layout.Vertical spacing="large">
      {data?.map(row => {
        return (
          <Layout.Horizontal spacing="large" key={row.fqn}>
            <Text className={css.rowCell}>{row.fqn}</Text>
            <Text lineClamp={1} width={150} className={css.rowCell}>
              {row.status === 'FAILURE' ? row.errorInfo?.summary : 'success'}
            </Text>
            <RowStatus row={row} />
          </Layout.Horizontal>
        )
      })}
    </Layout.Vertical>
  )
}

const SectionPanel = ({ accountId, selectedSection, preFlightCheckData }) => {
  return (
    <div className={css.sectionPanelWrapper}>
      {selectedSection === SECTIONS_DICT.CONNECTORS ? (
        <ConnectorsSection accountId={accountId} preFlightCheckData={preFlightCheckData} />
      ) : (
        <InputSetsSection preFlightCheckData={preFlightCheckData} />
      )}
    </div>
  )
}

const PreFlightCheckSections = ({ preFlightCheckData }) => {
  const [selectedSection, setSelectedSection] = useState(SECTIONS_DICT.INPUT_SET)
  return (
    <Layout.Horizontal spacing="medium" className={css.sectionsWrapper}>
      <SectionLabels
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        preFlightCheckData={preFlightCheckData}
      />
      <div className={css.divider} />
      <SectionPanel accountId={accountId} selectedSection={selectedSection} preFlightCheckData={preFlightCheckData} />
    </Layout.Horizontal>
  )
}

const PreFlightCheckFooter = ({ preFlightCheckData, onContinuePipelineClick, onCloseButtonClick }) => {
  // If the check is complete
  if (preFlightCheckData.status === 'SUCCESS' || preFlightCheckData.status === 'FAILURE') {
    return (
      <div className={css.footerSpaceBetween}>
        <Button text="Close" onClick={() => onCloseButtonClick()} />
        <Button text="Continue to run pipeline" minimal intent="primary" onClick={() => onContinuePipelineClick()} />
      </div>
    )
  }
  return (
    <div className={css.footer}>
      <Button text="Skip pre-flight check" onClick={() => onContinuePipelineClick()} />
      <Text className={css.footerSmallText}>You can skip pre-flight check and conntinue to run your pipeline</Text>
    </div>
  )
}

export const POLL_INTERVAL = 5 /* sec */ * 1000 /* ms */

export const PreFlightCheckModal: React.FC<PreFlightCheckModalProps> = ({
  accountId,
  orgIdentifier,
  projectIdentifier,
  pipelineIdentifier,
  inputSetPipelineYaml,
  onCloseButtonClick,
  onContinuePipelineClick
}) => {
  const [preFlightCheckId, setPreFlightCheckId] = useState('')
  const [preFlightCheckData, setPreFlightCheckData] = useState(preFlightDummyResponseProgress)
  const preFlightCheckDataRef = useRef(preFlightCheckData)
  preFlightCheckDataRef.current = preFlightCheckData

  const getPreFlightCheckId = () => {
    // Some API calls
    setPreFlightCheckId('preflightcheckid')
  }

  useEffect(() => {
    getPreFlightCheckId()
  }, [])

  // const getPreFlightCheckResponse = (preFlightCheckId: string) => {
  //   const { data, refetch, loading, error } = useGetPreFlightCheckResponse({
  //     preFlightCheckId,
  //     queryParams: {
  //       orgIdentifier,
  //       projectIdentifier,
  //       accountIdentifier: accountId
  //     }
  //   })
  // }

  const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min) //The maximum is exclusive and the minimum is inclusive
  }

  const getPreFlightResponse = () => {
    // API call
    const random = getRandomInt(0, 3)
    if (random % 3 === 0) {
      setPreFlightCheckData(preFlightDummyResponseProgress)
    } else if (random % 3 === 1) {
      setPreFlightCheckData(preFlightDummyResponseProgress)
    } else if (random % 3 === 2) {
      setPreFlightCheckData(preFlightDummyResponseProgress)
    }
  }

  // Setting up the polling
  useEffect(() => {
    if (preFlightCheckData?.status === 'INPROGRESS') {
      const timerId = window.setTimeout(() => {
        getPreFlightResponse()
      }, POLL_INTERVAL)

      return () => {
        window.clearTimeout(timerId)
      }
    }
  }, [preFlightCheckData])

  return (
    <Container className={css.preFlightCheckContainer} padding="medium">
      <ProgressBar intent={preFlightCheckData.status === 'FAILURE' ? 'danger' : 'success'} value={0.5} />
      <PreFlightCheckSections preFlightCheckData={preFlightCheckData} />
      <PreFlightCheckFooter
        preFlightCheckData={preFlightCheckData}
        onContinuePipelineClick={onContinuePipelineClick}
        onCloseButtonClick={onCloseButtonClick}
      />
    </Container>
  )
}
