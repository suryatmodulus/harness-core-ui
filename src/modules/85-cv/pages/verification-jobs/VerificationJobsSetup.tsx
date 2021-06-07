import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, IconName, RUNTIME_INPUT_VALUE, SelectOption } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import routes from '@common/RouteDefinitions'

import type { AccountPathProps, ProjectPathProps, VerificationPathProps } from '@common/interfaces/RouteInterfaces'

import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import { VerificationJobType } from '@cv/constants'
import { GetVerificationJobQueryParams, useGetVerificationJob } from 'services/cv'
import useCVTabsHook from '@cv/hooks/CVTabsHook/useCVTabsHook'
import CVOnboardingTabs from '@cv/components/CVOnboardingTabs/CVOnboardingTabs'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { OnBoardingPageHeader } from '../onboarding/OnBoardingPageHeader/OnBoardingPageHeader'
import VerificationJobsDetails from './VerificationJobsDetails/VerificationJobsDetails'
import TestVerificationJob from './TestVerificationJob/TestVerificationJob'
import CanaryBlueGreenVerificationJob from './CanaryBlueGreenVerificationJob/CanaryBlueGreenVerificationJob'
import HealthVerificationJob from './HealthVerificationJob/HealthVerificationJob'
import { baselineEnumToLabel, sensitivityEnunToLabel } from './VerificationJobForms/VerificationJobFormCommons'
import css from './VerificationJobsSetup.module.scss'

interface VerificationJobsData {
  name: string
  identifier: string
  type: string
}
interface ConfigureVerificationJobProps {
  currentData: any
  onPrevious: () => void
  onNext: (data: any) => void
}

export type VerificationSensitivity = 'HIGH' | 'LOW' | 'MEDIUM'

export const getIconByVerificationType = (type: string | undefined) => {
  switch (type) {
    case VerificationJobType.TEST:
      return 'lab-test'
    case VerificationJobType.CANARY:
      return 'canary-outline'
    case VerificationJobType.BLUE_GREEN:
      return 'bluegreen'
    case VerificationJobType.HEALTH:
      return 'health'

    default:
      return '' as IconName
  }
}

export function getRuntimeValueOrSelectOption(val?: string): SelectOption | string | undefined {
  if (!val) {
    return
  }
  return val === RUNTIME_INPUT_VALUE ? val : { label: val, value: val }
}

export function replaceNullWithRuntimeValue(jobType: string, val?: string): string | undefined {
  return jobType === VerificationJobType.CANARY ||
    jobType === VerificationJobType.BLUE_GREEN ||
    jobType === VerificationJobType.TEST
    ? RUNTIME_INPUT_VALUE
    : val
}

export function getRuntimeValueOrSelectOptionForBaseline(
  jobType: string,
  val: string | number
): SelectOption | string | undefined | number {
  if (!val) {
    return jobType === VerificationJobType.TEST ? RUNTIME_INPUT_VALUE : val
  }
  return val === RUNTIME_INPUT_VALUE ? val : { label: baselineEnumToLabel(val), value: val }
}

export function getRuntimeValueOrSelectOptionForSensitivity(
  jobType: string,
  val?: VerificationSensitivity | string
): SelectOption | string | undefined {
  if (!val) {
    return replaceNullWithRuntimeValue(jobType, val)
  }

  return val === RUNTIME_INPUT_VALUE
    ? val
    : { label: sensitivityEnunToLabel(val as VerificationSensitivity), value: val }
}

export function getRuntimeValueOrSelectOptionForTrafficSplit(
  jobType: string,
  val?: string
): SelectOption | string | undefined {
  if (!val) {
    return replaceNullWithRuntimeValue(jobType, val)
  }

  return getRuntimeValueOrSelectOption(val)
}

const ConfigureVerificationJob: React.FC<ConfigureVerificationJobProps> = props => {
  switch (props.currentData.type) {
    case VerificationJobType.TEST:
      return <TestVerificationJob stepData={props.currentData} onNext={props.onNext} onPrevious={props.onPrevious} />
    case VerificationJobType.CANARY:
    case VerificationJobType.BLUE_GREEN:
      return (
        <CanaryBlueGreenVerificationJob
          stepData={props.currentData}
          onNext={props.onNext}
          onPrevious={props.onPrevious}
        />
      )
    case VerificationJobType.HEALTH:
      return <HealthVerificationJob stepData={props.currentData} onNext={props.onNext} onPrevious={props.onPrevious} />

    default:
      return <div></div>
  }
}

const VerificationJobsSetup = (): JSX.Element => {
  const { projectIdentifier, orgIdentifier, accountId, verificationId } = useParams<
    AccountPathProps & ProjectPathProps & VerificationPathProps
  >()
  const { getString } = useStrings()

  const { onNext, currentData, setCurrentData, ...tabInfo } = useCVTabsHook<VerificationJobsData>({ totalTabs: 2 })
  const { data: verificationJob, loading, error, refetch: getVerificationJob } = useGetVerificationJob({ lazy: true })

  useEffect(() => {
    if (verificationId) {
      getVerificationJob({
        queryParams: {
          accountId,
          identifier: verificationId,
          orgIdentifier,
          projectIdentifier
        } as GetVerificationJobQueryParams
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationId])

  useEffect(() => {
    if (verificationJob?.data) {
      setCurrentData({
        ...pick(verificationJob.data, ['identifier', 'type']),
        allMonitoringSourcesEnabled: verificationJob.data?.allMonitoringSourcesEnabled,
        dataSource: verificationJob.data.monitoringSources?.map(source => ({
          label: source,
          value: source
        })),
        sensitivity: getRuntimeValueOrSelectOptionForSensitivity(
          verificationJob.data.type as string,
          (verificationJob.data as any).sensitivity
        ),
        trafficSplit: getRuntimeValueOrSelectOptionForTrafficSplit(
          verificationJob.data.type as string,
          (verificationJob.data as any).trafficSplitPercentage
        ),
        duration: getRuntimeValueOrSelectOption(verificationJob.data.duration),
        name: verificationJob.data.jobName,
        service: getRuntimeValueOrSelectOption(verificationJob.data.serviceIdentifier),
        environment: getRuntimeValueOrSelectOption(verificationJob.data.envIdentifier),
        activitySource: verificationJob.data.activitySourceIdentifier,
        baseline: getRuntimeValueOrSelectOptionForBaseline(
          verificationJob.data.type as string,
          (verificationJob.data as any).baselineVerificationJobInstanceId
        )
      } as VerificationJobsData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationJob?.data])
  return (
    <Container className={css.pageDimensions}>
      <OnBoardingPageHeader
        breadCrumbs={[
          {
            label: getString('verificationJobs'),
            url: routes.toCVAdminSetupVerificationJob({
              projectIdentifier,
              orgIdentifier,

              accountId
            })
          }
        ]}
      />
      {
        <Page.Body
          loading={Boolean(verificationId) && loading}
          key={Boolean(verificationId).toString() && loading?.toString()}
          error={getErrorMessage(error)}
        >
          <CVOnboardingTabs
            iconName={getIconByVerificationType(currentData?.type)}
            defaultEntityName={currentData?.name || 'Default Name'}
            setName={val => setCurrentData({ ...currentData, name: val } as VerificationJobsData)}
            onNext={onNext}
            {...tabInfo}
            tabProps={[
              {
                id: 1,
                title: getString('cv.verificationJobs.details.tabName'),
                component: (
                  <VerificationJobsDetails
                    stepData={currentData}
                    onNext={data => {
                      setCurrentData({ ...data })
                      onNext({ data: { ...data } })
                    }}
                  />
                )
              },
              {
                id: 2,
                title: getString('cv.verificationJobs.configure.tabName'),
                component: (
                  <ConfigureVerificationJob
                    onPrevious={tabInfo.onPrevious}
                    currentData={currentData}
                    onNext={data => {
                      setCurrentData({ ...data })
                      onNext({ data: { ...data } })
                    }}
                  />
                )
              }
            ]}
          />
        </Page.Body>
      }
    </Container>
  )
}

export default VerificationJobsSetup
