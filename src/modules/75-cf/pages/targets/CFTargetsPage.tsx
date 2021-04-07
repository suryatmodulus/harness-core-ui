import React, { useEffect, useState } from 'react'
import { Button, Container, Layout, Select, SelectOption, Text } from '@wings-software/uicore'
import { omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings, StringKeys } from 'framework/exports'
import type { GetEnvironmentListForProjectQueryParams } from 'services/cd-ng'
import { Target, Segment, useGetAllTargets, useGetAllSegments, useGetAllFeatures, Feature } from 'services/cf'
import { useEnvironments } from '@cf/hooks/environment'
import { Page } from '@common/exports'
import { useLocalStorage } from '@common/hooks'
import { CF_LOCAL_STORAGE_ENV_KEY, DEFAULT_ENV, getErrorMessage } from '@cf/utils/CFUtils'
import { PageError } from '@common/components/Page/PageError'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import IndividualTargets from './IndividualTargets'
import TargetSegmentsView from './TargetSegmentsView'
import css from './CFTargetsPage.module.scss'

interface HeaderContentProps {
  view: 'individual' | 'segments'
  leftLabel: string
  rightLabel: string
  onChangePage: () => void
}

const HeaderContent: React.FC<HeaderContentProps> = ({ view, onChangePage, leftLabel, rightLabel }) => (
  <Layout.Horizontal style={{ display: 'none' }}>
    <Button
      width={120}
      text={leftLabel}
      minimal={view === 'segments'}
      intent={view === 'individual' ? 'primary' : undefined}
      onClick={onChangePage}
    />
    <Button
      width={120}
      text={rightLabel}
      minimal={view === 'individual'}
      intent={view === 'segments' ? 'primary' : undefined}
      onClick={onChangePage}
    />
  </Layout.Horizontal>
)

interface HeaderToolbar {
  label: string
  environment?: SelectOption
  environments: SelectOption[]
  onChange: (opt: SelectOption) => void
}
const HeaderToolbar: React.FC<HeaderToolbar> = ({ label, environment, environments, onChange }) => (
  <Layout.Horizontal flex={{ align: 'center-center' }}>
    <Text margin={{ right: 'small' }} font={{ weight: 'bold' }}>
      {label}
    </Text>
    <Select value={environment} items={environments} onChange={onChange} />
  </Layout.Horizontal>
)

const CFTargetsPage: React.FC = () => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<any>()

  const { data: environments, loading: loadingEnvs, error: errEnvs, refetch: refetchEnvironments } = useEnvironments({
    projectIdentifier,
    accountIdentifier: accountId,
    orgIdentifier
  } as GetEnvironmentListForProjectQueryParams)

  const [view, setView] = useState<'individual' | 'segments'>('segments')
  const onChangePage = () => {
    view === 'individual' ? setTargetPage(0) : setSegmentPage(0)
    setView(view === 'individual' ? 'segments' : 'individual')
  }
  const { getString } = useStrings()
  const getSharedString = (key: string) =>
    getString(`cf.shared.${key}` as StringKeys /* TODO: fix this by using a map */)
  // const getPageString = (key: string) => getString(`cf.targets.${key}`)
  // const [environment, setEnvironment] = useState<SelectOption>()
  const [environment, setEnvironment] = useLocalStorage(CF_LOCAL_STORAGE_ENV_KEY, DEFAULT_ENV)

  const [targetPage, setTargetPage] = useState(0)
  const { data: targetsData, loading: loadingTargets, error: errTargets, refetch: fetchTargets } = useGetAllTargets({
    lazy: true,
    queryParams: {
      project: projectIdentifier,
      environment: (environment?.value || '') as string,
      pageNumber: targetPage,
      pageSize: 10,
      account: accountId,
      org: orgIdentifier
    }
  })

  const [segmentPage, setSegmentPage] = useState(0)
  const {
    data: segmentsData,
    loading: loadingSegments,
    error: errSegments,
    refetch: fetchSegments
  } = useGetAllSegments({
    lazy: true,
    queryParams: {
      project: projectIdentifier,
      environment: (environment?.value || '') as string,
      pageNumber: segmentPage,
      pageSize: 10,
      account: accountId,
      org: orgIdentifier
    }
  })

  const { data: flagsData, loading: loadingFlags, error: errFlags, refetch: fetchFlags } = useGetAllFeatures({
    lazy: true,
    queryParams: {
      project: projectIdentifier,
      environment: (environment?.value || '') as string,
      account: accountId,
      org: orgIdentifier
    }
  })

  useEffect(() => {
    if (environment && view === 'individual') {
      fetchTargets({
        queryParams: {
          project: projectIdentifier,
          environment: (environment?.value || '') as string,
          pageNumber: targetPage,
          pageSize: 10,
          account: accountId,
          org: orgIdentifier
        }
      })
    }
  }, [environment, view, targetPage])

  useEffect(() => {
    if (environment && view === 'segments') {
      fetchFlags()
      fetchSegments({
        queryParams: {
          project: projectIdentifier,
          environment: (environment?.value || '') as string,
          pageNumber: segmentPage,
          pageSize: 10,
          account: accountId,
          org: orgIdentifier
        }
      })
    }
  }, [environment, view, segmentPage])

  useEffect(() => {
    if (!loadingEnvs && environments?.length > 0 && environment?.label) {
      if (environments.find(v => v.value === environment.value)) {
        setEnvironment({ label: environment['label'], value: environment['value'] })
      } else {
        setEnvironment({ label: environments[0]['label'], value: environments[0]['value'] as string })
      }
    }
  }, [loadingEnvs])

  const loading = loadingEnvs || loadingFlags || loadingSegments || loadingTargets
  const error = errEnvs || errFlags || (view === 'segments' && errSegments) || (view === 'individual' && errTargets)

  return (
    <>
      <Page.Header
        title={getString('cf.shared.segments')}
        size="medium"
        content={
          <HeaderContent
            leftLabel={getSharedString('individual')}
            rightLabel={getSharedString('segments')}
            view={view}
            onChangePage={onChangePage}
          />
        }
        toolbar={
          <HeaderToolbar
            label={getSharedString('environment').toLocaleUpperCase()}
            environment={environment?.value ? environment : environments[0]}
            environments={environments}
            onChange={({ label, value }) => setEnvironment({ label, value: value as string })}
          />
        }
      />
      <Container className={css.pageBody}>
        {!error && !loading && (
          <>
            {view === 'individual' ? (
              <IndividualTargets
                targets={(targetsData?.targets ?? []) as Target[]}
                pagination={{ ...omit(targetsData, ['targets']), gotoPage: setTargetPage }}
                environment={environment?.value as string}
                project={projectIdentifier}
                orgIdentifier={orgIdentifier}
                accountId={accountId}
                onCreateTargets={fetchTargets}
                onDeleteTarget={fetchTargets}
              />
            ) : (
              <TargetSegmentsView
                segments={(segmentsData?.segments || []) as Segment[]}
                flags={(flagsData?.features || []) as Feature[]}
                pagination={{ ...(omit(segmentsData, ['segments']) as any), gotoPage: setSegmentPage }}
                environment={environment?.value as string}
                project={projectIdentifier}
                orgIdentifier={orgIdentifier}
                accountId={accountId}
                onCreateSegment={fetchSegments}
                onDeleteSegment={fetchSegments}
              />
            )}
          </>
        )}
        {error && (
          <PageError
            message={getErrorMessage(error)}
            onClick={() => {
              refetchEnvironments()
            }}
          />
        )}
        {loading && (
          <Container
            style={{
              position: 'fixed',
              top: 0,
              left: '270px',
              width: 'calc(100% - 270px)',
              height: 'calc(100% - 144px)',
              zIndex: 1
            }}
          >
            <ContainerSpinner />
          </Container>
        )}
      </Container>
    </>
  )
}

export default CFTargetsPage
