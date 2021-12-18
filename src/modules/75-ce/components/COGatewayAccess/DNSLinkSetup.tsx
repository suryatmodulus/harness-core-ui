/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Heading,
  Layout,
  Formik,
  FormikForm,
  Color,
  Text,
  useModalHook,
  SelectOption,
  Container,
  Select,
  Button
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { isEmpty as _isEmpty, values as _values, defaultTo as _defaultTo } from 'lodash-es'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import {
  AccessPoint,
  AccessPointCore,
  ALBAccessPointCore,
  useAccessPointResources,
  useListAccessPoints,
  AzureAccessPointCore
} from 'services/lw'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useGatewayContext } from '@ce/context/GatewayContext'
import { useToaster } from '@common/exports'
import type { AccessPointScreenMode } from '@ce/types'
import type { ConnectionMetadata, CustomDomainDetails, GatewayDetails } from '../COCreateGateway/models'
import { Utils } from '../../common/Utils'
import LoadBalancerDnsConfig from './LoadBalancerDnsConfig'
import AzureAPConfig from '../COAccessPointList/AzureAPConfig'
import {
  createApDetailsFromLoadBalancer,
  createAzureAppGatewayFromLoadBalancer,
  getAccessPointFetchQueryParams,
  getDummySupportedResourceFromAG,
  getDummySupportedResourceFromALB,
  getInitialAccessPointDetails,
  getSupportedResourcesQueryParams
} from './helper'
import LBAdvancedConfiguration from './LBAdvancedConfiguration'
import ResourceAccessUrlSelector from './ResourceAccessUrlSelector'
import css from './COGatewayAccess.module.scss'

const modalPropsLight: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 860,
    padding: 40,
    position: 'relative',
    minHeight: 500
  }
}

interface DNSLinkSetupProps {
  gatewayDetails: GatewayDetails
  setHelpTextSections: (s: string[]) => void
  setGatewayDetails: (gw: GatewayDetails) => void
  onInfoIconClick?: () => void
  activeStepDetails?: { count?: number; tabId?: string } | null
}

interface UseLoadBalancerProps {
  gatewayDetails: GatewayDetails
  loadBalancer: AccessPoint
  handleClose: (clearStatus?: boolean) => void
  mode: AccessPointScreenMode
  handleSave: (lb: AccessPoint) => void
}

const useLoadBalancerModal = (
  { gatewayDetails, loadBalancer, handleClose, mode, handleSave }: UseLoadBalancerProps,
  deps: any[] = []
) => {
  const isAwsProvider = Utils.isProviderAws(gatewayDetails.provider)
  const isAzureProvider = Utils.isProviderAzure(gatewayDetails.provider)

  const [openLoadBalancerModal, hideLoadBalancerModal] = useModalHook(() => {
    const onClose = (clearStatus = false) => {
      handleClose(clearStatus)
      hideLoadBalancerModal()
    }
    return (
      <Dialog onClose={hideLoadBalancerModal} {...modalPropsLight}>
        {isAwsProvider && (
          <LoadBalancerDnsConfig
            loadBalancer={loadBalancer}
            cloudAccountId={gatewayDetails.cloudAccount.id}
            onClose={onClose}
            mode={mode}
            onSave={handleSave}
          />
        )}
        {isAzureProvider && (
          <AzureAPConfig
            cloudAccountId={gatewayDetails.cloudAccount.id}
            onSave={handleSave}
            mode={mode}
            onClose={onClose}
            loadBalancer={loadBalancer}
          />
        )}
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            onClose(true)
          }}
          style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
          data-testid={'close-instance-modal'}
        />
      </Dialog>
    )
  }, deps)
  return {
    openLoadBalancerModal
  }
}

const DNSLinkSetup: React.FC<DNSLinkSetupProps> = props => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { showError } = useToaster()
  const isAwsProvider = Utils.isProviderAws(props.gatewayDetails.provider)
  const isAzureProvider = Utils.isProviderAzure(props.gatewayDetails.provider)
  const { isEditFlow } = useGatewayContext()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()

  const accessDetails = props.gatewayDetails.opts.access_details as ConnectionMetadata // eslint-disable-line
  const customDomainProviderDetails = props.gatewayDetails.routing.custom_domain_providers as CustomDomainDetails // eslint-disable-line

  const [apCoreList, setApCoreList] = useState<SelectOption[]>([])
  const [apCoreResponseList, setApCoreResponseList] = useState<AccessPointCore[]>([])
  const [selectedLoadBalancer, setSelectedLoadBalancer] = useState<AccessPointCore>()
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false)

  const [accessPoint, setAccessPoint] = useState<AccessPoint>()
  const [selectedApCore, setSelectedApCore] = useState<SelectOption>()

  const {
    data: accessPoints,
    loading: accessPointsLoading,
    refetch: refetchAccessPoints
  } = useListAccessPoints({
    account_id: accountId, // eslint-disable-line
    queryParams: getAccessPointFetchQueryParams({ gatewayDetails: props.gatewayDetails, accountId }, isAwsProvider)
  })

  const {
    data: apCoresResponse,
    loading: apCoresLoading,
    refetch: apCoresRefetch
  } = useAccessPointResources({
    account_id: accountId, // eslint-disable-line
    queryParams: getSupportedResourcesQueryParams({ gatewayDetails: props.gatewayDetails, accountId })
  })

  useEffect(() => {
    if (props.gatewayDetails.accessPointID) {
      const targetAp = accessPoints?.response?.find(_ap => _ap.id === props.gatewayDetails.accessPointID)
      if (targetAp) {
        setAccessPoint(targetAp)
      }
    }
  }, [accessPoints?.response])

  useEffect(() => {
    const submittedAccessPoints = accessPoints?.response?.filter(_item => _item.status === 'submitted')
    if (apCoresResponse?.response?.length == 0 && _isEmpty(submittedAccessPoints)) {
      return
    }

    const apCoresResponseMap: Record<string, AccessPointCore> = {}
    apCoresResponse?.response?.forEach(_item => {
      apCoresResponseMap[_item.details?.name as string] = _item
    })

    submittedAccessPoints?.forEach(_item => {
      apCoresResponseMap[_item.name as string] = getDummyResource(_item)
    })
    setApCoreResponseList(_values(apCoresResponseMap))
  }, [apCoresResponse?.response, accessPoints?.response])

  useEffect(() => {
    const loaded: SelectOption[] = apCoreResponseList?.map(_ap => ({
      label: _ap.details?.name as string,
      value: isAwsProvider
        ? ((_ap.details as ALBAccessPointCore)?.albARN as string)
        : isAzureProvider
        ? ((_ap.details as AzureAccessPointCore).id as string)
        : ''
    }))
    setApCoreList(_defaultTo(loaded, []))
  }, [apCoreResponseList])

  useEffect(() => {
    const resourceId = isAwsProvider
      ? accessPoint?.metadata?.albArn
      : _defaultTo(accessPoint?.metadata?.app_gateway_id, accessPoint?.id) // handled case for "submitted" state access points
    const selectedResource = resourceId && apCoreList.find(_item => _item.value === resourceId)
    if (selectedResource) {
      setSelectedApCore(selectedResource)
    }
  }, [accessPoint, apCoreList])

  const clearAPData = () => {
    setSelectedApCore({ label: '', value: '' })
    updateLoadBalancerDetails()
    setSelectedLoadBalancer(undefined)
  }

  const getDummyResource = (data: AccessPoint) => {
    return isAwsProvider ? getDummySupportedResourceFromALB(data) : getDummySupportedResourceFromAG(data)
  }

  const getLoadBalancerToEdit = () => {
    let lb: AccessPoint = {}
    if (isAwsProvider) {
      lb = isCreateMode
        ? getInitialAccessPointDetails({
            gatewayDetails: props.gatewayDetails,
            accountId,
            projectId: projectIdentifier,
            orgId: orgIdentifier
          })
        : createApDetailsFromLoadBalancer({
            lbDetails: selectedLoadBalancer,
            gatewayDetails: props.gatewayDetails,
            accountId,
            projectId: projectIdentifier,
            orgId: orgIdentifier
          })
    } else if (isAzureProvider) {
      lb = createAzureAppGatewayFromLoadBalancer(
        {
          gatewayDetails: props.gatewayDetails,
          accountId,
          lbDetails: selectedLoadBalancer?.details as AzureAccessPointCore
        },
        isCreateMode
      )
    }
    return lb
  }

  const { openLoadBalancerModal } = useLoadBalancerModal(
    {
      gatewayDetails: props.gatewayDetails,
      mode: Utils.getConditionalResult(isCreateMode, 'create', 'import'),
      loadBalancer: getLoadBalancerToEdit(),
      handleClose: clearStatus => {
        if (clearStatus && !isCreateMode) {
          clearAPData()
        }
        if (isCreateMode) setIsCreateMode(false)
      },
      handleSave: savedLb => {
        setAccessPoint(savedLb)
        if (isCreateMode) {
          setIsCreateMode(false)
        }
        if (isAwsProvider) {
          apCoresRefetch()
        }
        if (isAzureProvider) {
          refetchAccessPoints()
        }
      }
    },
    [selectedLoadBalancer, isCreateMode]
  )

  useEffect(() => {
    if (!accessPoint || !accessPoint.id) return
    const updatedGatewayDetails = {
      ...props.gatewayDetails,
      accessPointID: accessPoint.id,
      accessPointData: accessPoint
    }
    props.setGatewayDetails(updatedGatewayDetails)
    // setGeneratedHostName(generateHostName(accessPoint.host_name as string))
  }, [accessPoint])

  const updateLoadBalancerDetails = (_accessPointDetails?: AccessPoint) => {
    const updatedGatewayDetails = {
      ...props.gatewayDetails,
      accessPointID: _defaultTo(_accessPointDetails?.id, ''),
      accessPointData: _accessPointDetails
      // hostName: generateHostName(_accessPointDetails?.host_name || '')
    }
    props.setGatewayDetails(updatedGatewayDetails)
    // setGeneratedHostName(updatedGatewayDetails.hostName || getString('ce.co.dnsSetup.autoURL'))
  }

  const isValidLoadBalancer = (lb: AccessPointCore) => {
    let isValid = false
    if (isAwsProvider) {
      isValid = Boolean(
        lb &&
          accessPoints?.response
            ?.map(_ap => _ap.metadata?.albArn)
            ?.filter(_i => _i)
            ?.includes((lb.details as ALBAccessPointCore)?.albARN)
      )
      if (!isValid) {
        isValid = Boolean(lb && accessPoint?.metadata?.albArn === (lb.details as ALBAccessPointCore)?.albARN)
      }
    }
    if (isAzureProvider) {
      isValid = Boolean(
        lb &&
          accessPoints?.response
            ?.map(_ap => Utils.getConditionalResult(_ap.status === 'submitted', _ap.id, _ap.metadata?.app_gateway_id))
            .filter(_i => _i)
            .includes((lb.details as AzureAccessPointCore).id)
      )
      if (!isValid) {
        isValid = Boolean(lb && accessPoint?.metadata?.app_gateway_id === (lb.details as AzureAccessPointCore)?.id)
      }
    }
    return isValid
  }

  const handleLoadBalancerSelection = (item: SelectOption) => {
    setSelectedApCore(item)
    const matchedLb = apCoreResponseList?.find(_lb =>
      isAwsProvider
        ? item.value === (_lb.details as ALBAccessPointCore)?.albARN
        : item.value === (_lb.details as AzureAccessPointCore)?.id
    )
    setSelectedLoadBalancer(matchedLb)
    if (isValidLoadBalancer(matchedLb as AccessPointCore)) {
      let linkedAccessPoint = accessPoints?.response?.find(_ap =>
        isAwsProvider
          ? _ap.metadata?.albArn === (matchedLb?.details as ALBAccessPointCore)?.albARN
          : (_ap.metadata?.app_gateway_id || _ap.id) === (matchedLb?.details as AzureAccessPointCore)?.id
      )
      if (!linkedAccessPoint) {
        linkedAccessPoint = accessPoint
      }

      // Use only those Access Points which are not in errored state.
      if (linkedAccessPoint?.status === 'errored') {
        showError(getString('ce.co.autoStoppingRule.setupAccess.erroredAccessPointSelectionText'))
        clearAPData()
      } else {
        updateLoadBalancerDetails(linkedAccessPoint)
      }
    } else {
      isCreateMode && setIsCreateMode(false)
      openLoadBalancerModal()
    }
  }

  const handleCreateNewLb = () => {
    setIsCreateMode(true)
    trackEvent('MadeNewAccessPoint', {})
    openLoadBalancerModal()
  }

  return (
    <Layout.Vertical spacing="medium" padding="medium">
      <Heading level={3}>{getString('ce.co.gatewayAccess.dnsLinkHeader')}</Heading>

      <Formik
        initialValues={{
          usingCustomDomain: Utils.getConditionalResult(!_isEmpty(props.gatewayDetails.customDomains), 'yes', 'no'),
          customURL: props.gatewayDetails.customDomains?.join(','),
          publicallyAccessible: _defaultTo(accessDetails.dnsLink.public as string, 'yes'),
          dnsProvider: customDomainProviderDetails
            ? customDomainProviderDetails.route53
              ? 'route53'
              : 'others'
            : 'route53',
          route53Account: Utils.getConditionalResult(
            !_isEmpty(customDomainProviderDetails?.route53),
            customDomainProviderDetails?.route53?.hosted_zone_id,
            ''
          )
          // accessPoint: props.gatewayDetails.accessPointID
        }}
        formName="dnsLinkSetup"
        enableReinitialize={true}
        onSubmit={values => alert(JSON.stringify(values))}
        validationSchema={Yup.object().shape({
          customURL: Yup.string()
            .trim()
            .matches(
              /((https?):\/\/)?(www.)?[a-z0-9-]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#-]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
              'Enter a valid URL'
            )
            .required()
        })}
        render={formik => (
          <FormikForm>
            <Layout.Vertical spacing="large">
              <Container className={css.dnsLinkContainer}>
                <Heading level={3} font={{ weight: 'bold' }} className={css.header}>
                  {getString(
                    Utils.getConditionalResult(
                      isAwsProvider,
                      'ce.co.autoStoppingRule.setupAccess.selectLb',
                      'ce.co.autoStoppingRule.setupAccess.selectAppGateway'
                    )
                  )}
                </Heading>
                <Layout.Horizontal className={css.selectLoadBalancerContainer}>
                  {/* <img src={loadBalancerSvg} className={css.helperImage} /> */}
                  <div>
                    <Text className={css.helpText}>
                      {getString('ce.co.autoStoppingRule.setupAccess.selectLbHelpText')}
                    </Text>
                    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Select
                        name="accessPoint"
                        // label={getString('ce.co.autoStoppingRule.setupAccess.chooseLbText')}
                        items={apCoreList}
                        onChange={e => {
                          // formik.setFieldValue('accessPoint', e.value)
                          handleLoadBalancerSelection(e)
                          trackEvent('SelectingAccessPoint', {})
                        }}
                        value={selectedApCore}
                        disabled={isEditFlow || accessPointsLoading || apCoresLoading}
                        className={css.loadBalancerSelector}
                      />
                      {!isEditFlow && (
                        <Text color={Color.PRIMARY_6} onClick={handleCreateNewLb} style={{ cursor: 'pointer' }}>
                          {`+${Utils.getConditionalResult(
                            isAwsProvider,
                            getString('ce.co.accessPoint.new'),
                            getString('ce.co.accessPoint.newAppGateway')
                          )}`}
                        </Text>
                      )}
                    </Layout.Horizontal>
                  </div>
                </Layout.Horizontal>
              </Container>
              {_isEmpty(props.gatewayDetails.routing.container_svc) && (
                <LBAdvancedConfiguration
                  gatewayDetails={props.gatewayDetails}
                  setGatewayDetails={props.setGatewayDetails}
                  activeStepDetails={props.activeStepDetails}
                />
              )}
              <ResourceAccessUrlSelector
                formikProps={formik}
                gatewayDetails={props.gatewayDetails}
                setGatewayDetails={props.setGatewayDetails}
                setHelpTextSections={props.setHelpTextSections}
              />
            </Layout.Vertical>
          </FormikForm>
        )}
      ></Formik>
    </Layout.Vertical>
  )
}

export default DNSLinkSetup
