import React from 'react'
import { useParams } from 'react-router-dom'
import set from 'lodash-es/set'
import {
  Layout,
  Formik,
  Button,
  FormikForm,
  FormInput,
  Container,
  CardSelect,
  SelectOption,
  Text,
  StepProps,
  Tag,
  Color
} from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import {
  DelegateSizeDetails,
  useGetDelegateSizes,
  useValidateKubernetesYaml,
  DelegateSetupDetails
} from 'services/portal'

import { useListDelegateProfilesNg } from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import type { DelegateProfile } from '@delegates/DelegateInterface'
import { useToaster } from '@common/exports'

import type { StepK8Data } from '@delegates/DelegateInterface'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { AddDescriptionAndTagsWithIdentifier } from '@common/components/AddDescriptionAndTags/AddDescriptionAndTags'

import { DelegateSize } from '@delegates/constants'
import css from './DelegateSetupStep.module.scss'

interface DelegateSetupStepProps {
  onBack?: any
}

enum k8sPermissionType {
  CLUSTER_ADMIN = 'CLUSTER_ADMIN',
  CLUSTER_VIEWER = 'CLUSTER_VIEWER',
  NAMESPACE_ADMIN = 'NAMESPACE_ADMIN'
}

const delegateSizeUpto = {
  [DelegateSize.LAPTOP]: 2,
  [DelegateSize.SMALL]: 10,
  [DelegateSize.MEDIUM]: 20,
  [DelegateSize.LARGE]: 40
}

//this regex is retrieved from kubernetes
const delegateNameRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/g

const formatProfileList = (data: any): Array<SelectOption> => {
  const profiles: Array<DelegateProfile> = data?.resource?.response

  const options: Array<SelectOption> = profiles
    ? profiles.map((item: DelegateProfile) => {
        return { label: item.name || '', value: item.uuid || '' }
      })
    : [{ label: '', value: '' }]
  return options
}

const getDefaultDelegateConfiguration = (data: any) => {
  const configurations: DelegateProfile[] = data?.resource?.response
  return configurations ? configurations.find((item: DelegateProfile) => item.primary) : null
}

const filterDelegatesize = (delegateSizes: any, size: any) => {
  return delegateSizes.find((item: any) => item.size === size.value)
}

const formatDelegateSizeArr = (delegateSizes: any) => {
  if (!delegateSizes) {
    return []
  }
  return delegateSizes.map((item: any) => ({
    label: item.label,
    value: item.size
  }))
}

const getDefaultDelegateSize = (delegateSizes: DelegateSizeDetails[]) => {
  return delegateSizes
    ? delegateSizes.find((item: DelegateSizeDetails) => item.size === DelegateSize.LAPTOP)
    : undefined
}

const getProfile = (data: any, configId: any) => {
  const configs: DelegateProfile[] = data?.resource?.response
  const selProfile = configs ? configs.find(item => item.uuid == configId) : null
  return selProfile?.selectors
}

const DelegateSetup: React.FC<StepProps<StepK8Data> & DelegateSetupStepProps> = props => {
  const initialValues = props?.prevStepData?.delegateYaml
    ? props?.prevStepData?.delegateYaml
    : {
        name: '',
        identifier: '',
        description: '',
        delegateConfigurationId: '',
        size: DelegateSize.LAPTOP,
        sesssionIdentifier: '',
        k8sConfigDetails: {
          k8sPermissionType: k8sPermissionType.CLUSTER_ADMIN,
          namespace: ''
        }
      }

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const { mutate: createKubernetesYaml } = useValidateKubernetesYaml({
    queryParams: { accountId, projectId: projectIdentifier, orgId: orgIdentifier }
  })

  const { data } = useListDelegateProfilesNg({
    queryParams: { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  })
  const { data: delegateSizes } = useGetDelegateSizes({
    queryParams: { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  })
  const defaultProfile = getDefaultDelegateConfiguration(data)
  const delegateSizeMappings: DelegateSizeDetails[] | undefined = delegateSizes?.resource
  const selectCardData = formatDelegateSizeArr(delegateSizeMappings)
  const profileOptions: SelectOption[] = formatProfileList(data)
  const { showError } = useToaster()
  const defaultSize: DelegateSizeDetails | undefined = delegateSizeMappings
    ? getDefaultDelegateSize(delegateSizeMappings)
    : undefined
  // const [configurations, setConfigOptions] = React.useState(profileOptions)
  const [selectedCard, setSelectedCard] = React.useState<SelectOption | undefined>()

  const [formData, setInitValues] = React.useState<DelegateSetupDetails>(initialValues)

  const [selectedPermission, setSelectedPermission] = React.useState<k8sPermissionType>(
    k8sPermissionType[initialValues?.k8sConfigDetails?.k8sPermissionType || k8sPermissionType.CLUSTER_ADMIN]
  )
  const onSubmit = async (values: DelegateSetupDetails) => {
    const createParams = values
    if (projectIdentifier) {
      set(createParams, 'projectIdentifier', projectIdentifier)
    }
    if (orgIdentifier) {
      set(createParams, 'orgIdentifier', orgIdentifier)
    }
    const response = await createKubernetesYaml({
      ...createParams,
      k8sConfigDetails: {
        k8sPermissionType: selectedPermission,
        namespace: selectedPermission === k8sPermissionType.NAMESPACE_ADMIN ? values?.k8sConfigDetails?.namespace : ''
      }
    })
    if ((response as any)?.responseMessages.length) {
      const err = (response as any)?.responseMessages?.[0]?.message
      showError(err)
    } else {
      const delegateYaml = response.resource
      if (delegateSizeMappings) {
        const delegateSize: DelegateSizeDetails =
          delegateSizeMappings.find((item: DelegateSizeDetails) => item.size === values.size) || delegateSizeMappings[0]
        if (delegateSize) {
          const stepPrevData = {
            delegateYaml,
            replicas: delegateSize?.replicas
          }
          props?.nextStep?.(stepPrevData)
        }
      }
    }
  }

  React.useEffect(() => {
    if (defaultSize) {
      const defaultCard: SelectOption = selectCardData.find((item: SelectOption) => item.value === defaultSize.size)
      setSelectedCard(defaultCard)
    }
  }, [defaultSize])

  React.useEffect(() => {
    if (defaultProfile) {
      formData['delegateConfigurationId'] = defaultProfile?.uuid
      setInitValues({ ...formData })
    }
  }, [defaultProfile])

  const getTagClsName = (size: string) => {
    if (size === DelegateSize.SMALL) {
      return css.small
    } else if (size === DelegateSize.LAPTOP) {
      return css.extraSmall
    } else if (size === DelegateSize.MEDIUM) {
      return css.medium
    } else if (size === DelegateSize.LARGE) {
      return css.large
    }
  }
  return (
    <Layout.Vertical padding="xxlarge">
      <Container padding="small">
        <Formik
          initialValues={formData}
          onSubmit={values => {
            setInitValues(values)
            onSubmit(values)
            /** to do here */
          }}
          formName="delegateSetupStepForm"
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .trim()
              .required(getString('delegate.delegateNameRequired'))
              .matches(delegateNameRegex, getString('delegates.delegateNameRegexIssue')),
            size: Yup.string().trim().required(getString('delegate.delegateSizeRequired')),
            delegateConfigurationId: Yup.string().trim().required(getString('delegate.delegateConfigRequired')),
            k8sConfigDetails: Yup.object().shape({
              k8sPermissionType: Yup.string().trim().required(getString('delegates.permissionRequired')),
              namespace:
                selectedPermission === k8sPermissionType.NAMESPACE_ADMIN
                  ? Yup.string().trim().required(getString('delegates.delegateNamespaceRequired'))
                  : Yup.string().trim()
            })
          })}
        >
          {(formikProps: FormikProps<DelegateSetupDetails>) => {
            const selectors: any = getProfile(data, formikProps.values.delegateConfigurationId)
            return (
              <FormikForm>
                <Container className={css.delegateForm}>
                  <Layout.Horizontal className={css.baseContainer}>
                    <Layout.Vertical className={css.leftPanel}>
                      <div className={css.formGroup}>
                        <AddDescriptionAndTagsWithIdentifier
                          identifierProps={{
                            inputLabel: getString('delegate.delegateName')
                          }}
                        />
                      </div>
                      {delegateSizeMappings && (
                        <Layout.Vertical className={css.delegateSizeField}>
                          <label className={css.delegateSizeLabel}>{getString('delegate.delegateSize')}</label>
                          <div className={css.formGroup}>
                            <CardSelect
                              cornerSelected={true}
                              data={selectCardData}
                              selected={
                                selectCardData[
                                  selectCardData.findIndex((card: any) => card.value === selectedCard?.value)
                                ]
                              }
                              renderItem={item => {
                                const cardData = filterDelegatesize(delegateSizeMappings, item)

                                const tagClsName = getTagClsName(cardData.size)
                                return (
                                  <Container className={`${css.cardWrapper}`}>
                                    <div className={`${tagClsName} ${css.sizeTag}`}>{cardData.label}</div>
                                    <Layout.Vertical className={css.textCenter}>
                                      <div className={css.uptoText}>
                                        {getString('delegates.delegateSizeUpTo', {
                                          count: delegateSizeUpto[cardData.size as DelegateSize]
                                        })}
                                      </div>
                                      <Text className={css.replicaText}>
                                        {getString('delegates.replicaText')}
                                        {cardData.replicas}{' '}
                                      </Text>
                                    </Layout.Vertical>

                                    <Container className={css.footer}>
                                      <Layout.Vertical className={css.textCenter}>
                                        <Text className={css.footerHeader}>
                                          {' '}
                                          {getString('delegate.totalMem').toLocaleUpperCase()}
                                        </Text>
                                        <Text className={css.footerContent}>
                                          {(Number(cardData.ram) / 1000).toFixed(1)}
                                          {getString('delegates.totalMemUnit')}
                                        </Text>
                                      </Layout.Vertical>

                                      <Layout.Vertical className={css.textCenter}>
                                        <Text className={css.footerHeader}>
                                          {getString('delegate.totalCpu').toLocaleUpperCase()}
                                        </Text>
                                        <Text className={css.footerContent}>{cardData.cpu}</Text>
                                      </Layout.Vertical>
                                    </Container>
                                  </Container>
                                )
                              }}
                              onChange={size => {
                                /* istanbul ignore next */
                                setSelectedCard(size)
                                formikProps.setFieldValue('size', size.value)
                              }}
                              className={`grid ${css.delegateSizeWrapper}`}
                            />
                          </div>

                          <Container className={css.workloadSeparator}>
                            <Text color={Color.ORANGE_500}>{getString('delegate.productionWorkloads')}</Text>
                          </Container>
                        </Layout.Vertical>
                      )}
                      <div className={`${css.formGroup} ${css.profileSelect}`}>
                        <FormInput.Select
                          items={profileOptions}
                          label={getString('delegate.delegateConfigurations')}
                          name={'delegateConfigurationId'}
                        />
                      </div>

                      {formikProps.values.delegateConfigurationId && selectors && (
                        <Container className={css.profileSelectors}>
                          <Text>{getString('delegate.tagsFromDelegateConfig')}</Text>
                          <div className={css.profileSelectorsItemsContainer}>
                            {selectors.map((item: string) => (
                              <Tag key={item}>{item}</Tag>
                            ))}
                          </div>
                        </Container>
                      )}
                    </Layout.Vertical>
                    <Layout.Vertical className={css.rightPanel}>
                      <div className={css.permissionsTitle}>{getString('delegates.delegatePermissions.title')}</div>
                      <CardSelect
                        cardClassName={css.permissionSelect}
                        cornerSelected={true}
                        selected={selectedPermission}
                        onChange={selected => {
                          setSelectedPermission(selected)
                          formikProps.validateForm()
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                        data={[
                          k8sPermissionType.CLUSTER_ADMIN,
                          k8sPermissionType.CLUSTER_VIEWER,
                          k8sPermissionType.NAMESPACE_ADMIN
                        ]}
                        renderItem={item => {
                          let title
                          let subtitle
                          if (item === k8sPermissionType.CLUSTER_ADMIN) {
                            title = getString('delegates.delegatePermissions.clusterWriteTitle')
                            subtitle = getString('delegates.delegatePermissions.clusterWriteContent')
                          } else if (item === k8sPermissionType.CLUSTER_VIEWER) {
                            title = getString('delegates.delegatePermissions.clusterReadTitle')
                            subtitle = getString('delegates.delegatePermissions.clusterReadContent')
                          } else if (item === k8sPermissionType.NAMESPACE_ADMIN) {
                            title = getString('delegates.delegatePermissions.specificNamespaceTitle')
                            subtitle = getString('delegates.delegatePermissions.specificNamespaceContent')
                          }
                          return (
                            <Container>
                              <div className={css.permissionSelectTitle}>{title}</div>
                              <Text className={css.permissionSelectDetails}>{subtitle}</Text>
                              {item === k8sPermissionType.NAMESPACE_ADMIN && (
                                <div className={css.namespace}>
                                  <FormInput.Text
                                    label={getString('common.namespace')}
                                    name="k8sConfigDetails.namespace"
                                  />
                                </div>
                              )}
                            </Container>
                          )
                        }}
                      />
                    </Layout.Vertical>
                  </Layout.Horizontal>
                </Container>
                <Layout.Horizontal className={css.formFooter}>
                  <Button
                    id="delegateSetupBackBtn"
                    className={`${css.backBtn} ${css.footerBtn}`}
                    text={getString('back')}
                    onClick={props.onBack}
                    icon="chevron-left"
                    margin={{ right: 'small' }}
                  />
                  <Button
                    type="submit"
                    className={`${css.submitBtn} ${css.footerBtn}`}
                    text={getString('continue')}
                    intent="primary"
                    rightIcon="chevron-right"
                    // onClick={() => {
                    //   if (props?.nextStep) {
                    //     props?.nextStep?.()
                    //   }
                    //   // const selectedIdx = selectedTabIndex
                    //   // setSelectedTabId(panels[selectedIdx + 1].id)
                    //   // setSelectedTabIndex(selectedIdx + 1)
                    // }}
                  />
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Container>
    </Layout.Vertical>
  )
}

export default DelegateSetup
