import React, { useState, useEffect } from 'react'
import { Text, Layout, Container, Button, Color, Icon, Link, Card, CardBody, IconName } from '@wings-software/uicore'
import cx from 'classnames'
import { useParams, useHistory, useLocation } from 'react-router-dom'
import {
  useGetCVSetupStatus,
  RestResponseCVSetupStatus,
  useGetDefaultHealthVerificationJob,
  useGetAvailableMonitoringSources
} from 'services/cv'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import routes from '@common/RouteDefinitions'
import type { UseGetMockData } from '@common/utils/testUtils'
import { MonitoringSourceSetupRoutePaths } from '@cv/utils/routeUtils'
import { useIndexedDBHook, CVObjectStoreNames } from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import { useToaster } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/exports'
import { pluralize } from '@common/utils/StringUtils'
import { CVSelectionCard } from '@cv/components/CVSelectionCard/CVSelectionCard'
import ProgressStatus from './ProgressStatus/ProgressStatus'
import OnboardedSourceSummary from './OnboardedSourceSummary/OnboardedSourceSummary'
import { SetupIndexDBData, Step, getCardLabelByType, getIconBySourceType } from './SetupUtils'
import i18n from './CVSetupPage.i18n'
import css from './CVSetupPage.module.scss'

export const StepIndex = new Map([
  [Step.CHANGE_SOURCE, 1],
  [Step.MONITORING_SOURCE, 2],
  [Step.VERIFICATION_JOBS, 3]
])

const Status = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  NOT_VISITED: 'NOT_VISITED'
}

const ChangeSourcesHarness = [
  {
    type: 'HarnessCD_1.0',
    icon: 'cd-main',
    label: 'Harness CD FirstGen',
    routeName: 'harness-cd',
    routeUrl: routes.toCVActivitySourceSetup
  }
]

const ChangeSources = [
  {
    type: 'K8sCluster',
    icon: 'service-kubernetes',
    label: 'Kubernetes',
    routeName: 'kubernetes',
    routeUrl: routes.toCVActivitySourceSetup
  }
]

const MonitoringSources = [
  {
    type: 'AppDynamics',
    icon: 'service-appdynamics',
    label: 'AppDynamics',
    routeName: MonitoringSourceSetupRoutePaths.APP_DYNAMICS,
    routeUrl: routes.toCVAdminSetupMonitoringSource
  },
  {
    type: 'GoogleCloudOperations',
    icon: 'service-stackdriver',
    label: 'Google Cloud Operations',
    routeName: MonitoringSourceSetupRoutePaths.GOOGLE_CLOUD_OPERATIONS,
    routeUrl: routes.toCVAdminSetupMonitoringSource
  }
  // {
  //   type: 'NewRelic',
  //   icon: 'service-newrelic',
  //   label: 'New Relic',
  //   routeName: MonitoringSourceSetupRoutePaths.NEW_RELIC,
  //   routeUrl: routes.toCVAdminSetupMonitoringSource
  // }
]
interface CVSetupPageProps {
  setupStatusMockData?: UseGetMockData<RestResponseCVSetupStatus>
}
interface ActivitySourceContentProps {
  setActiveStep: (val: string) => void
  setActivitySource: (val: string) => void
  setMonitoringSource: (val: string) => void
  step: string | null
  indexDBData: SetupIndexDBData
}

const ActivitySourceContent: React.FC<ActivitySourceContentProps> = props => {
  const history = useHistory()
  const { getString } = useStrings()
  const [showSummary, setShowSummary] = useState(Boolean(props.step))
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()

  return (
    <Container>
      <Container height="calc(100vh - 100px)">
        <div className={css.monitoringContent}>
          {showSummary && props.indexDBData?.activitySources?.length ? (
            <OnboardedSourceSummary
              sources={props.indexDBData?.activitySources}
              title={`You have added ${props.indexDBData.activitySources.length} Change Source${pluralize(
                props.indexDBData.activitySources.length
              )}`}
              setShowSummary={setShowSummary}
              buttonText={getString('cv.onboarding.activitySources.addMoreSources')}
            />
          ) : (
            <>
              <Text font={{ size: 'medium' }} margin={{ top: 'xlarge', bottom: 'small' }}>
                {i18n.changeSource.content.heading.start}
              </Text>
              <Text>{i18n.changeSource.content.info}</Text>
              <Layout.Horizontal margin={{ top: 'xxlarge' }}>
                <Layout.Vertical margin={{ right: 'xxlarge' }}>
                  <Text>{i18n.harness} </Text>
                  <div className={css.items}>
                    {ChangeSourcesHarness.map((item, index) => {
                      return (
                        <div
                          className={css.cardWrapper}
                          key={`${index}${item}`}
                          onClick={() => {
                            history.push(
                              item.routeUrl({
                                activitySource: item.routeName,
                                projectIdentifier,
                                orgIdentifier,
                                accountId
                              })
                            )
                          }}
                        >
                          <Card interactive={true} className={css.cardCss}>
                            <CardBody.Icon icon={item.icon as IconName} iconSize={40} />
                          </Card>
                          <div className={css.cardLabel}>{item.label}</div>
                        </div>
                      )
                    })}
                  </div>
                </Layout.Vertical>
                <Layout.Vertical>
                  <Text>{i18n.infrastructureProvider} </Text>
                  <div className={css.items}>
                    {ChangeSources.map((item, index) => {
                      return (
                        <div
                          className={css.cardWrapper}
                          key={`${index}${item}`}
                          onClick={() => {
                            history.push(
                              item.routeUrl({
                                activitySource: item.routeName,
                                projectIdentifier,
                                orgIdentifier,
                                accountId
                              })
                            )
                          }}
                        >
                          <Card interactive={true} className={css.cardCss}>
                            <CardBody.Icon icon={item.icon as IconName} iconSize={40} />
                          </Card>
                          <div className={css.cardLabel}>{item.label}</div>
                        </div>
                      )
                    })}
                  </div>
                </Layout.Vertical>
              </Layout.Horizontal>
            </>
          )}
        </div>
      </Container>
      <Layout.Horizontal style={{ margin: 'auto', width: '70%' }}>
        <Text margin={{ right: 'xsmall' }}>{i18n.changeSource.noActivitySource}</Text>

        <Link
          withoutHref
          onClick={() => {
            props.setActiveStep(Step.MONITORING_SOURCE)
            props.setActivitySource(Status.COMPLETED)
            props.setMonitoringSource(Status.ACTIVE)
          }}
        >
          {i18n.changeSource.skip}
        </Link>
      </Layout.Horizontal>
    </Container>
  )
}
interface MonitoringSourceContentProps {
  statusData: RestResponseCVSetupStatus | null
  setActiveStep: (val: string) => void
  setActivitySource: (val: string) => void
  setMonitoringSource: (val: string) => void
  setVerificationJob: (val: string) => void
  monitoringSource: string
  step: string | null
  indexDBData: SetupIndexDBData
}
const MonitoringSourceContent: React.FC<MonitoringSourceContentProps> = props => {
  const history = useHistory()
  const { getString } = useStrings()
  const [showSummary, setShowSummary] = useState(Boolean(props.step))
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()

  return (
    <Layout.Horizontal>
      <Container height="100vh" width="70%">
        <div className={css.monitoringContent}>
          {showSummary && props.indexDBData?.monitoringSources?.length ? (
            <OnboardedSourceSummary
              sources={props.indexDBData?.monitoringSources}
              title={`You have added ${props.indexDBData.monitoringSources.length} Monitoring Source${pluralize(
                props.indexDBData.monitoringSources.length
              )}`}
              setShowSummary={setShowSummary}
              buttonText={getString('cv.onboarding.monitoringSources.addMoreSources')}
            />
          ) : (
            <>
              <Text font={{ size: 'medium' }} margin={{ top: 'xlarge', bottom: 'small' }}>
                {i18n.monitoringSource.content.heading}
              </Text>
              <Text>{i18n.monitoringSource.content.info}</Text>
              <div className={css.items}>
                {MonitoringSources.map((item, index) => {
                  return (
                    <div
                      className={css.cardWrapper}
                      key={`${index}${item}`}
                      onClick={() => {
                        history.push(
                          item.routeUrl({
                            monitoringSource: item.routeName,
                            projectIdentifier,
                            orgIdentifier,
                            accountId
                          })
                        )
                      }}
                    >
                      <Card interactive={true} className={css.cardCss}>
                        <CardBody.Icon icon={item.icon as IconName} iconSize={40} />
                      </Card>
                      <div className={css.cardLabel}>{item.label}</div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </Container>
    </Layout.Horizontal>
  )
}

interface VerificatiionContentProps {
  indexDBData: SetupIndexDBData
  step: string | null
}

const VerificatiionContent: React.FC<VerificatiionContentProps> = props => {
  const history = useHistory()
  const { getString } = useStrings()
  const [showSummary] = useState(Boolean(props.step))
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { data, loading } = useGetDefaultHealthVerificationJob({
    queryParams: { accountId, projectIdentifier, orgIdentifier }
  })
  return (
    <Layout.Horizontal>
      <Container height="100vh" width="100%">
        <div className={css.monitoringContent}>
          <Text
            font={{ size: 'medium', weight: 'bold' }}
            color={Color.BLACK}
            margin={{ top: 'xlarge', bottom: 'small' }}
          >
            {showSummary
              ? getString('cv.onboarding.verificationJobs.keepGoing')
              : getString('cv.onboarding.verificationJobs.heading')}
          </Text>
          <Text margin={{ bottom: 'large' }} color={Color.GREY_600}>
            {getString('cv.onboarding.verificationJobs.infoText')}
          </Text>
          {!loading ? (
            <>
              <Text color={Color.GREY_600}>{getString('cv.onboarding.verificationJobs.subHeading')}</Text>
              <div className={css.items}>
                <Layout.Vertical
                  spacing="small"
                  padding={{ right: 'small' }}
                  onClick={() => {
                    history.push(
                      routes.toCVAdminSetupVerificationJobEdit({
                        accountId,
                        projectIdentifier,
                        orgIdentifier,
                        verificationId: data?.data?.identifier as string
                      })
                    )
                  }}
                >
                  <CVSelectionCard
                    isSelected={true}
                    className={css.monitoringCard}
                    iconProps={{
                      name: 'health',
                      size: 20
                    }}
                    cardLabel={getString('health')}
                  />
                  <Text
                    color={Color.BLUE_500}
                    font={{ size: 'small' }}
                    style={{ maxWidth: 80, textOverflow: 'ellipsis' }}
                    lineClamp={1}
                  >
                    {data?.data?.jobName}
                  </Text>
                </Layout.Vertical>
                {props.indexDBData?.verificationJobs?.length
                  ? props.indexDBData.verificationJobs.map((item, index) => {
                      return (
                        <Layout.Vertical
                          spacing="small"
                          padding={{ right: 'small' }}
                          key={`${item}${index}`}
                          onClick={() => {
                            history.push(
                              routes.toCVAdminSetupVerificationJobEdit({
                                accountId,
                                projectIdentifier,
                                orgIdentifier,
                                verificationId: item.identifier
                              })
                            )
                          }}
                        >
                          <CVSelectionCard
                            isSelected={true}
                            className={css.monitoringCard}
                            iconProps={{
                              name: getIconBySourceType(item.type) as IconName,
                              size: 20
                            }}
                            cardLabel={getCardLabelByType(item.type)}
                          />
                          <Text
                            color={Color.BLUE_500}
                            font={{ size: 'small' }}
                            style={{ maxWidth: 80, textOverflow: 'ellipsis', textAlign: 'center' }}
                            lineClamp={1}
                          >
                            {item.name}
                          </Text>
                        </Layout.Vertical>
                      )
                    })
                  : null}
              </div>
            </>
          ) : (
            <Text>Checking for default jobs ...</Text>
          )}
          <Text margin={{ bottom: 'large' }} color={Color.GREY_600}>
            {getString('cv.onboarding.verificationJobs.createJobQues')}
          </Text>
          <Button
            text={getString('cv.onboarding.verificationJobs.createJob')}
            intent="primary"
            onClick={() =>
              history.push(
                routes.toCVAdminSetupVerificationJob({
                  accountId,
                  projectIdentifier,
                  orgIdentifier
                })
              )
            }
          />
        </div>
      </Container>
    </Layout.Horizontal>
  )
}

const CVSetupPage: React.FC<CVSetupPageProps> = props => {
  const [changeSource, setChangeSource] = useState<string>(Status.ACTIVE)
  const [monitoringSource, setMonitoringSource] = useState<string>(Status.NOT_VISITED)
  const [verificationJob, setVerificationJob] = useState<string>(Status.NOT_VISITED)
  const [activeStep, setActiveStep] = useState<string>(Step.CHANGE_SOURCE)
  const { getString } = useStrings()
  const location = useLocation()
  const history = useHistory()
  const { showWarning } = useToaster()
  const [indexDBData, setIndexDBData] = useState<SetupIndexDBData>()
  const { isInitializingDB, dbInstance: setUpDbInstance } = useIndexedDBHook({})

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const queryParams = new URLSearchParams(location.search)
  const step = queryParams.get('step')

  const { data: allMonitoringSources } = useGetAvailableMonitoringSources({
    queryParams: { accountId: accountId, projectIdentifier: projectIdentifier, orgIdentifier: orgIdentifier }
  })
  const { data, loading, refetch, error } = useGetCVSetupStatus({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier
    },
    mock: props.setupStatusMockData
  })
  // Might not need this api now
  // const categories = data?.resource?.stepsWhichAreCompleted

  const clearDB = async () => {
    try {
      await setUpDbInstance?.clear(CVObjectStoreNames.SETUP)
      setUpDbInstance?.close()
    } catch (e) {
      showWarning(e)
    }
  }

  const historyUnlisten = history.listen(loc => {
    if (!loc.pathname.includes('/admin/setup')) {
      clearDB()
      historyUnlisten()
    }
  })

  const hasOnBoardedMonitoringSources =
    Number(indexDBData?.monitoringSources?.length) > 0 || Number(allMonitoringSources?.resource?.length) > 0
  useEffect(() => {
    if (step) {
      if (!isInitializingDB && setUpDbInstance) {
        setUpDbInstance
          .get(CVObjectStoreNames.SETUP, `${accountId}-${orgIdentifier}-${projectIdentifier}`)
          ?.then(resultData => {
            if (resultData) {
              setIndexDBData(resultData)
            }

            if (step === '1') {
              if (activeStep === Step.MONITORING_SOURCE) {
                setChangeSource(Status.COMPLETED)
              }
            }

            if (step === '2') {
              if (activeStep === Step.CHANGE_SOURCE) {
                setActiveStep(Step.MONITORING_SOURCE)
                setMonitoringSource(Status.ACTIVE)
                setChangeSource(Status.COMPLETED)
              }
            }
            if (step === '3') {
              if (activeStep === Step.CHANGE_SOURCE) {
                setActiveStep(Step.VERIFICATION_JOBS)
                setVerificationJob(Status.COMPLETED)
                setChangeSource(Status.COMPLETED)
                setMonitoringSource(Status.COMPLETED)
              }
            }
          })
      }
    }
  }, [isInitializingDB, setUpDbInstance])
  return (
    <Container>
      {loading || isInitializingDB ? (
        <PageSpinner />
      ) : error?.data ? (
        <div style={{ height: '100vh' }}>
          <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
        </div>
      ) : (
        <Layout.Horizontal height="100vh">
          <Layout.Vertical padding="large" width="30%">
            <Text>Setup</Text>
            <Container height="calc(100vh - 128px)" margin={'small'}>
              <Layout.Vertical style={{ position: 'relative', top: 150 }}>
                <Layout.Horizontal>
                  <Layout.Vertical spacing="xsmall">
                    {changeSource === Status.COMPLETED ? (
                      <Icon name="tick-circle" color="green500" size={20} />
                    ) : activeStep === Step.CHANGE_SOURCE && changeSource === Status.ACTIVE ? (
                      <span className={css.number}>1</span>
                    ) : (
                      <Text>1</Text>
                    )}
                    <div
                      className={cx(css.dashedLine, {
                        [css.dashedLineVisited]: changeSource !== Status.NOT_VISITED,
                        [css.dashedLineNotVisited]: changeSource === Status.NOT_VISITED
                      })}
                    ></div>
                  </Layout.Vertical>
                  <Layout.Vertical width="90%" className={css.stepLabel} spacing="small">
                    <Text
                      font={{ size: 'medium', weight: 'bold' }}
                      color={activeStep === Step.CHANGE_SOURCE ? Color.BLACK : Color.GREY_500}
                    >
                      {i18n.changeSource.heading}
                    </Text>
                    <Text font={{ weight: 'light' }} color={Color.GREY_400}>
                      {i18n.changeSource.info}
                    </Text>
                  </Layout.Vertical>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Layout.Vertical spacing="xsmall">
                    {monitoringSource === Status.COMPLETED ? (
                      <Icon name="tick-circle" color="green500" size={20} />
                    ) : activeStep === Step.MONITORING_SOURCE && monitoringSource === Status.ACTIVE ? (
                      <span className={css.number}>2</span>
                    ) : (
                      <span className={css.onlyNumber}> 2</span>
                    )}
                    <div
                      className={cx(css.dashedLine, {
                        [css.dashedLineVisited]: monitoringSource !== Status.NOT_VISITED,
                        [css.dashedLineNotVisited]: monitoringSource === Status.NOT_VISITED
                      })}
                    ></div>
                  </Layout.Vertical>
                  <Layout.Vertical width="90%" className={css.stepLabel} spacing="small">
                    <Text
                      font={{ size: 'medium', weight: 'bold' }}
                      color={activeStep === Step.MONITORING_SOURCE ? Color.BLACK : Color.GREY_500}
                    >
                      {i18n.monitoringSource.heading}
                    </Text>
                    <Text font={{ weight: 'light' }} color={Color.GREY_400}>
                      {i18n.monitoringSource.info}
                    </Text>
                  </Layout.Vertical>
                </Layout.Horizontal>
                <Layout.Horizontal>
                  <Layout.Vertical>
                    {verificationJob === Status.COMPLETED ? (
                      <Icon name="tick-circle" color="green500" size={20} />
                    ) : activeStep === Step.VERIFICATION_JOBS && verificationJob === Status.ACTIVE ? (
                      <span className={css.number}>{3}</span>
                    ) : (
                      <span className={css.onlyNumber}> 3</span>
                    )}
                  </Layout.Vertical>
                  <Layout.Vertical width="90%" className={css.stepLabel} spacing="small">
                    <Text
                      font={{ size: 'medium', weight: 'bold' }}
                      color={activeStep === Step.VERIFICATION_JOBS ? Color.BLACK : Color.GREY_500}
                    >
                      {i18n.verificationJob.heading}
                    </Text>
                    <Text font={{ weight: 'light' }} color={Color.GREY_400} padding={{ top: 10 }}>
                      {i18n.verificationJob.info}
                    </Text>
                  </Layout.Vertical>
                </Layout.Horizontal>
              </Layout.Vertical>
            </Container>
            <Layout.Horizontal spacing="medium">
              {activeStep !== Step.CHANGE_SOURCE && (
                <Button
                  text={getString('previous')}
                  icon="chevron-left"
                  onClick={() => {
                    if (activeStep === Step.CHANGE_SOURCE) {
                      history.push(routes.toCVProjectOverview({ accountId, projectIdentifier, orgIdentifier }))
                    } else if (activeStep === Step.MONITORING_SOURCE) {
                      setActiveStep(Step.CHANGE_SOURCE)
                      setChangeSource(Status.ACTIVE)
                    } else if (activeStep === Step.VERIFICATION_JOBS) {
                      setActiveStep(Step.MONITORING_SOURCE)
                      setMonitoringSource(Status.ACTIVE)
                    }
                  }}
                />
              )}
              <Button
                intent="primary"
                disabled={activeStep === Step.MONITORING_SOURCE && !hasOnBoardedMonitoringSources}
                text={step === '3' ? getString('finish') : getString('next')}
                rightIcon="chevron-right"
                onClick={() => {
                  if (activeStep === Step.CHANGE_SOURCE) {
                    setActiveStep(Step.MONITORING_SOURCE)
                    setMonitoringSource(Status.ACTIVE)
                    setChangeSource(Status.COMPLETED)
                  } else if (activeStep === Step.MONITORING_SOURCE) {
                    setActiveStep(Step.VERIFICATION_JOBS)
                    setVerificationJob(Status.ACTIVE)
                    setMonitoringSource(Status.COMPLETED)
                  } else if (activeStep === Step.VERIFICATION_JOBS) {
                    history.push(routes.toCVProjectOverview({ accountId, projectIdentifier, orgIdentifier }))
                  }
                }}
              />
            </Layout.Horizontal>
          </Layout.Vertical>
          <Container
            background={Color.GREY_200}
            width={data?.resource?.totalNumberOfEnvironments && data?.resource?.totalNumberOfServices ? '50%' : '70%'}
          >
            {activeStep === Step.CHANGE_SOURCE ? (
              <ActivitySourceContent
                setActiveStep={setActiveStep}
                setActivitySource={setChangeSource}
                setMonitoringSource={setMonitoringSource}
                step={step}
                indexDBData={indexDBData as SetupIndexDBData}
                // setActivitySourceType={setActivitySourceType}
              />
            ) : activeStep === Step.MONITORING_SOURCE ? (
              <MonitoringSourceContent
                step={step}
                indexDBData={indexDBData as SetupIndexDBData}
                statusData={data}
                monitoringSource={monitoringSource}
                setActiveStep={setActiveStep}
                setActivitySource={setChangeSource}
                setMonitoringSource={setMonitoringSource}
                setVerificationJob={setVerificationJob}
              />
            ) : activeStep === Step.VERIFICATION_JOBS ? (
              <VerificatiionContent step={step} indexDBData={indexDBData as SetupIndexDBData} />
            ) : null}
          </Container>
          {data?.resource?.totalNumberOfEnvironments && data?.resource?.totalNumberOfServices ? (
            <ProgressStatus
              numberOfServicesUsedInActivitySources={data?.resource?.numberOfServicesUsedInActivitySources}
              numberOfServicesUsedInMonitoringSources={data?.resource?.numberOfServicesUsedInMonitoringSources}
              totalNumberOfEnvironments={data?.resource?.totalNumberOfEnvironments}
              totalNumberOfServices={data?.resource?.totalNumberOfServices}
              servicesUndergoingHealthVerification={data?.resource?.servicesUndergoingHealthVerification}
            />
          ) : null}
        </Layout.Horizontal>
      )}
    </Container>
  )
}

export default CVSetupPage
