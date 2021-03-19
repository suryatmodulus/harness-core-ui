import React, { useState } from 'react'
import cx from 'classnames'
import {
  Color,
  Layout,
  Text,
  Container,
  Card,
  Button,
  CardBody,
  Heading,
  Icon,
  useModalHook,
  StepWizard,
  FormInput,
  Formik,
  Checkbox,
  ExpandingSearchInput
} from '@wings-software/uicore'

import { Classes, Menu, MenuItem, Dialog } from '@blueprintjs/core'
import { Form } from 'formik'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { useGet, useMutate } from 'restful-react'
import { useHistory } from 'react-router-dom'
import { Page } from '@common/exports'

import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/exports'
import css from './HomePage.module.scss'

enum Views {
  CREATE,
  EDIT
}

interface DashboardInterface {
  id: string
  type: string
  description: string
  title: string
  view_count?: number | undefined
  favorite_count?: number | undefined
}

const i18n: { [key: string]: string } = {
  'AWS Cost Dashboard':
    'AWS Cost Dashboard allows you to view your AWS cloud costs at a glance, understand what is costing the most, and analyze cost trends',
  'GCP Cost Dashboard':
    'GCP Cost Dashboard allows you to view your GCP cloud costs at a glance, understand what is costing the most, and analyze cost trends',
  'Cluster Cost Dashboard':
    'Cluster Cost Dashboard allows you to view your cluster cloud costs at a glance, understand what is costing the most, and analyze cost trends',
  'Multi-cloud Cost Overview Dashboard':
    'Multi-cloud Cost Dashboard provides a unified view of your cloud cost data across the cloud environment',
  'AWS Reservation Efficiency':
    'AWS reservation efficiency report contains the detail of how reserved instances are utilized. It tracks your AWS usage across your AWS account and provides detail of how efficient is your reserved instance usage'
}

const FirstStep = (props: any): JSX.Element => {
  const { getString } = useStrings()
  const { accountId } = useParams()
  const [errorMessage, setErrorMessage] = React.useState('')
  const history = useHistory()
  const { mutate: createDashboard, loading } = useMutate({
    verb: 'POST',
    path: 'dashboard/create',
    queryParams: { accountId: accountId }
  })

  const submitForm = async (formData: { name: string; description: string }) => {
    const response = await createDashboard(formData)
    return response
  }

  return (
    <Layout.Vertical spacing="xxlarge" padding="medium" style={{ height: '100%' }}>
      <Text font="medium" color={Color.BLACK_100} style={{ marginTop: 'var(--spacing-large)' }}>
        {getString('dashboards.createModal.stepOne')}
      </Text>
      <Formik
        initialValues={{ name: '', description: '' }}
        validationSchema={Yup.object().shape({
          name: Yup.string().trim().required(getString('dashboards.createModal.nameValidation'))
        })}
        onSubmit={(formData: { name: string; description: string }) => {
          setErrorMessage('')
          const response = submitForm(formData)
          response
            .then(data => {
              if (data?.resource) {
                history.push({
                  pathname: routes.toViewCustomDashboard({
                    viewId: data?.resource,
                    accountId: accountId
                  })
                })
                props?.hideModal?.()
              }
            })
            .catch(() => {
              setErrorMessage(getString('dashboards.createModal.submitFail'))
            })
        }}
      >
        {formik => (
          <Form className={css.formContainer}>
            <Layout.Horizontal style={{ justifyContent: 'space-between' }}>
              <Layout.Vertical spacing="xsmall" style={{ width: '55%', paddingRight: 'var(--spacing-xxlarge)' }}>
                <FormInput.Text
                  name="name"
                  label={getString('name')}
                  placeholder={getString('dashboards.createModal.namePlaceholder')}
                />
                <FormInput.Text
                  name="description"
                  label={getString('description')}
                  placeholder={getString('dashboards.createModal.descriptionPlaceholder')}
                />
                <Layout.Vertical style={{ marginTop: '180px' }}>
                  <Button
                    type="submit"
                    intent="primary"
                    style={{ width: '150px', marginTop: '148px' }}
                    text={getString('continue')}
                    disabled={loading}
                    className={css.button}
                  />
                  {errorMessage && (
                    <section style={{ color: 'var(--red-700)', marginTop: 'var(--spacing-small)' }}>
                      {errorMessage}
                    </section>
                  )}
                </Layout.Vertical>
              </Layout.Vertical>

              <Card className={cx(css.dashboardCard)} style={{ width: '280px', height: '320px' }}>
                <Container padding="xlarge">
                  <Layout.Vertical spacing="large">
                    <Icon name={'dashboard'} size={25} color={Color.GREY_400} />
                    <Text color={Color.BLACK_100} font={{ size: 'medium', weight: 'semi-bold' }}>
                      {formik?.values?.name || getString('dashboards.createModal.sampleTitle')}
                    </Text>
                    <Text color={Color.GREY_350}>
                      {formik?.values?.description || getString('dashboards.createModal.sampleDesc')}
                    </Text>
                    <Layout.Horizontal
                      spacing="medium"
                      style={{ borderTop: '1px solid var(--grey-200)', paddingTop: 'var(--spacing-large)' }}
                    >
                      <Container
                        style={{ width: '50%', borderRadius: '5px' }}
                        padding="small"
                        background={Color.GREY_100}
                      >
                        <Icon name="eye-open" size={16} style={{ marginBottom: '10px' }} />
                        <Layout.Horizontal style={{ alignItems: 'baseline' }}>
                          <Text color={Color.BLACK_100} font={{ size: 'medium', weight: 'semi-bold' }}>
                            {0}
                          </Text>
                          &nbsp;{getString('dashboards.createModal.view')}
                        </Layout.Horizontal>
                      </Container>
                      <Container
                        style={{ width: '50%', borderRadius: '5px' }}
                        padding="small"
                        background={Color.GREY_100}
                      >
                        <Icon name="star-empty" size={16} style={{ marginBottom: '10px' }} />
                        <Layout.Horizontal style={{ alignItems: 'baseline' }}>
                          <Text color={Color.BLACK_100} font={{ size: 'medium', weight: 'semi-bold' }}>
                            {0}
                          </Text>
                          &nbsp;{getString('dashboards.createModal.fav')}
                        </Layout.Horizontal>
                      </Container>
                    </Layout.Horizontal>
                    <Layout.Vertical spacing="medium">
                      <Text color={Color.GREY_400}>{getString('dashboards.createModal.dataSource')}</Text>
                      <Layout.Horizontal spacing="medium">
                        <Icon name="ce-main" size={22} />
                        <Icon name="cd-main" size={22} />
                        <Icon name="ci-main" size={22} />
                        <Icon name="cf-main" size={22} />
                      </Layout.Horizontal>
                    </Layout.Vertical>
                  </Layout.Vertical>
                </Container>
              </Card>
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

const HomePage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams()
  const history = useHistory()
  const [_dashboardList, _setDashboardList] = React.useState<DashboardInterface[]>([])
  const [filteredDashboardList, setFilteredList] = React.useState<DashboardInterface[]>([])
  const [view, setView] = useState(Views.CREATE)
  const [isHarness, setHarnessCheckbox] = React.useState<boolean>(false)
  const [isCustom, setCustomChecbox] = React.useState<boolean>(false)
  const { data: dashboardList, loading, error } = useGet({
    // Inferred from RestfulProvider in index.js
    path: 'dashboard/list',
    queryParams: { accountId: accountId }
  })

  React.useEffect(() => {
    if (dashboardList) {
      if (dashboardList?.resource?.list) {
        dashboardList?.resource?.list.map((x: DashboardInterface) => {
          if (x.type === 'SHARED') {
            x['description'] = i18n[x['title']]
          }
        })
      }
      _setDashboardList(dashboardList?.resource?.list)
      setFilteredList(dashboardList?.resource?.list)
    }
  }, [dashboardList])

  React.useEffect(() => {
    if (isHarness) {
      const filteredData = _dashboardList.filter((x: { type: string }) => x.type === 'SHARED')
      setFilteredList(filteredData)
    }

    if (isCustom) {
      const filteredData = _dashboardList.filter((x: { type: string }) => x.type === 'ACCOUNT')
      setFilteredList(filteredData)
    }

    if ((isHarness && isCustom) || (!isHarness && !isCustom)) {
      setFilteredList(_dashboardList)
    }
  }, [isHarness, isCustom])

  const onSearch = (searchData: string) => {
    if (searchData) {
      const filteredData = _dashboardList.filter(x => x.description.toLowerCase().search(searchData) !== -1)

      setFilteredList(filteredData)
    } else {
      setFilteredList(_dashboardList)
    }
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        onClose={() => {
          setView(Views.CREATE)
          hideModal()
        }}
        className={cx(css.dialog, Classes.DIALOG, {
          [css.create]: view === Views.CREATE
        })}
      >
        {view === Views.CREATE ? (
          <StepWizard stepClassName={css.stepClass}>
            <FirstStep
              name={getString('dashboards.createModal.stepOne')}
              formData={{}}
              hideModal={hideModal}
              handleViewChange={{}}
            />
            {null}
          </StepWizard>
        ) : null}

        {view === Views.EDIT ? <section>se</section> : null}

        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            setView(Views.CREATE)
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [view]
  )

  return (
    <Page.Body
      loading={loading}
      className={css.pageContainer}
      retryOnError={() => {
        return
      }}
      error={(error?.data as Error)?.message}
    >
      <Layout.Vertical
        padding="large"
        background={Color.GREY_100}
        style={{ borderBottom: '1px solid var(--grey-200)' }}
      >
        <Text color={Color.BLACK} font={{ size: 'medium', weight: 'bold' }}>
          {getString('dashboards.homePage.title')}
        </Text>
      </Layout.Vertical>
      <Layout.Horizontal
        padding="medium"
        style={{ borderBottom: '1px solid var(--grey-200)', justifyContent: 'space-between' }}
        flex={true}
      >
        <Layout.Horizontal spacing="medium" style={{ justifyContent: 'inherit', alignItems: 'center', width: '368px' }}>
          <Button
            intent="primary"
            text={getString('cv.navLinks.dashboard')}
            icon="plus"
            style={{ background: 'var(--blue-700)', borderColor: 'var(--blue-700)', width: '110px' }}
            onClick={() => showModal()}
          />
          <Layout.Horizontal className={css.filter}>
            <Checkbox
              label={'By Harness'}
              key={'By Harness'}
              defaultChecked={false}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                setHarnessCheckbox(event.currentTarget.checked)
              }}
            />

            <Checkbox
              label={'Custom'}
              key={'Custom'}
              defaultChecked={false}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                setCustomChecbox(event.currentTarget.checked)
              }}
            />
          </Layout.Horizontal>
        </Layout.Horizontal>

        <ExpandingSearchInput
          autoFocus={false}
          placeholder="Search Dashboard"
          throttle={200}
          onChange={(text: string) => {
            onSearch(text)
          }}
        />
      </Layout.Horizontal>
      {filteredDashboardList && filteredDashboardList.length > 0 && (
        <Layout.Vertical padding="large">
          <Container height="90%">
            <Layout.Masonry
              center
              gutter={25}
              items={filteredDashboardList}
              renderItem={(dashboard: {
                id: string
                type: string
                description: string
                title: string
                view_count?: number
                favorite_count?: number
              }) => (
                <Card className={cx(css.dashboardCard)}>
                  <Container padding="xlarge">
                    {dashboard?.type !== 'SHARED' && dashboard?.type !== 'ACCOUNT' && (
                      <CardBody.Menu
                        menuContent={
                          <Menu>
                            <MenuItem text="edit" />
                          </Menu>
                        }
                        menuPopoverProps={{
                          className: Classes.DARK
                        }}
                      />
                    )}

                    <Layout.Vertical
                      spacing="large"
                      onClick={() => {
                        history.push({
                          pathname: routes.toViewCustomDashboard({
                            viewId: dashboard.id,
                            accountId: accountId
                          })
                        })
                      }}
                    >
                      <Layout.Horizontal style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Icon
                          name={dashboard?.type === 'SHARED' ? 'harness' : 'dashboard'}
                          size={25}
                          color={dashboard?.type === 'ACCOUNT' ? Color.GREY_400 : Color.BLUE_500}
                        />
                      </Layout.Horizontal>
                      <Text color={Color.BLACK_100} font={{ size: 'medium', weight: 'semi-bold' }}>
                        {dashboard?.title}
                      </Text>
                      {dashboard?.description && (
                        <Text color={Color.GREY_350} style={{ lineHeight: '20px' }}>
                          {dashboard?.description}
                        </Text>
                      )}
                      {!dashboard?.description && (
                        <Text color={Color.GREY_350} style={{ lineHeight: '20px' }}>
                          {i18n[dashboard?.title]}
                        </Text>
                      )}
                      <Layout.Horizontal spacing="medium">
                        {dashboard?.type !== 'SHARED' && (
                          <>
                            <Container
                              style={{ width: '50%', borderRadius: '5px' }}
                              padding="small"
                              background={Color.GREY_100}
                            >
                              <Icon name="eye-open" size={16} style={{ marginBottom: '10px' }} />
                              <Layout.Horizontal style={{ alignItems: 'baseline' }}>
                                <Text color={Color.BLACK_100} font={{ size: 'medium', weight: 'semi-bold' }}>
                                  {dashboard?.view_count}
                                </Text>
                                &nbsp;{getString('dashboards.createModal.view')}
                              </Layout.Horizontal>
                            </Container>
                            <Container
                              style={{ width: '50%', borderRadius: '5px' }}
                              padding="small"
                              background={Color.GREY_100}
                            >
                              <Icon name="star-empty" size={16} style={{ marginBottom: '10px' }} />
                              <Layout.Horizontal style={{ alignItems: 'baseline' }}>
                                <Text color={Color.BLACK_100} font={{ size: 'medium', weight: 'semi-bold' }}>
                                  {dashboard?.favorite_count}
                                </Text>
                                &nbsp;{getString('dashboards.createModal.fav')}
                              </Layout.Horizontal>
                            </Container>
                          </>
                        )}
                      </Layout.Horizontal>
                      <Layout.Vertical spacing="medium">
                        <Text color={Color.GREY_400}>{getString('dashboards.createModal.dataSource')}</Text>
                        <Layout.Horizontal spacing="medium">
                          <Icon name="ce-main" size={22} />
                          {/* <Icon name="cd-main" size={22} />
                        <Icon name="ci-main" size={22} />
                        <Icon name="cf-main" size={22} /> */}
                        </Layout.Horizontal>
                      </Layout.Vertical>
                    </Layout.Vertical>
                  </Container>
                </Card>
              )}
              keyOf={dashboard => dashboard?.id}
            />
          </Container>
        </Layout.Vertical>
      )}
      {filteredDashboardList && filteredDashboardList.length === 0 && (
        <Container width="100%" height="100%" flex={{ align: 'center-center' }}>
          <Layout.Vertical spacing="medium" width={470} style={{ alignItems: 'center', marginTop: '-48px' }}>
            <Icon name="dashboard" color={Color.GREY_300} size={35} />
            <Heading level={2} font={{ align: 'center' }} color={Color.GREY_500}>
              {'No dashboards available'}
            </Heading>
          </Layout.Vertical>
        </Container>
      )}
    </Page.Body>
  )
}

export default HomePage
