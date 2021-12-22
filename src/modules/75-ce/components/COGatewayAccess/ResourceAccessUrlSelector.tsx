import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty as _isEmpty, debounce as _debounce, defaultTo as _defaultTo } from 'lodash-es'
import { Checkbox, Color, Container, FormInput, Heading, Layout, SelectOption, Text } from '@wings-software/uicore'
import { Radio } from '@blueprintjs/core'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { Utils } from '@ce/common/Utils'
import { useAllHostedZones } from 'services/lw'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGatewayContext } from '@ce/context/GatewayContext'
import type { GatewayDetails } from '../COCreateGateway/models'
import CustomDomainMapping from './CustomDomainMapping'
import css from './COGatewayAccess.module.scss'

interface ResourceAccessUrlSelectorProps {
  formikProps: FormikProps<any> // TODO: change the type
  gatewayDetails: GatewayDetails
  setGatewayDetails: (details: GatewayDetails) => void
  setHelpTextSections: (s: string[]) => void
}

const ResourceAccessUrlSelector: React.FC<ResourceAccessUrlSelectorProps> = ({
  gatewayDetails,
  setGatewayDetails,
  formikProps,
  setHelpTextSections
}) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { isEditFlow } = useGatewayContext()
  const isAwsProvider = Utils.isProviderAws(gatewayDetails.provider)

  const [hostedZonesList, setHostedZonesList] = useState<SelectOption[]>([])
  const [dnsProvider, setDNSProvider] = useState<string>(
    Utils.getConditionalResult(
      !_isEmpty(gatewayDetails.routing.custom_domain_providers?.route53?.hosted_zone_id),
      'route53',
      'others'
    )
  )

  const {
    data: hostedZones,
    loading: hostedZonesLoading,
    refetch: loadHostedZones
  } = useAllHostedZones({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: gatewayDetails.cloudAccount.id, // eslint-disable-line
      region: 'us-east-1',
      domain: _defaultTo(gatewayDetails.customDomains?.[0], ''),
      accountIdentifier: accountId
    },
    lazy: !isEditFlow
  })

  useEffect(() => {
    if (hostedZonesLoading) {
      return
    }
    if (hostedZones?.response?.length === 0) {
      return
    }
    const loadedhostedZones: SelectOption[] =
      hostedZones?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setHostedZonesList(loadedhostedZones)
  }, [hostedZones, hostedZonesLoading])

  useEffect(() => {
    if (dnsProvider === 'route53') {
      loadHostedZones()
    }
  }, [dnsProvider])

  const getServerNames = () => {
    return gatewayDetails.routing.ports?.map(record => record.server_name).filter(v => !_isEmpty(v))
  }

  useEffect(() => {
    const serverNames = getServerNames()
    if (!_isEmpty(serverNames)) {
      debouncedCustomDomainTextChange(serverNames.join(','), true)
    }
  }, [gatewayDetails.routing.ports])

  const shouldDisplayPublicAccessCheck = () => {
    return _isEmpty(gatewayDetails.routing.container_svc)
  }

  const debouncedCustomDomainTextChange = React.useCallback(
    _debounce((value: string, shouldLoadHostedZones: boolean) => {
      const updatedGatewayDetails = { ...gatewayDetails }
      if (!updatedGatewayDetails.routing.custom_domain_providers) {
        updatedGatewayDetails.routing = {
          ...gatewayDetails.routing,
          custom_domain_providers: { others: {} } // eslint-disable-line
        }
      }
      updatedGatewayDetails.customDomains = value.split(',')
      setGatewayDetails(updatedGatewayDetails)
      setHelpTextSections(['usingCustomDomain'])
      shouldLoadHostedZones && loadHostedZones()
    }, 500),
    [gatewayDetails]
  )

  return (
    <>
      <Container className={css.dnsLinkContainer}>
        <Layout.Horizontal spacing="small" style={{ marginBottom: 'var(--spacing-xlarge)' }}>
          <Heading level={3} font={{ weight: 'light' }}>
            {getString('ce.co.autoStoppingRule.setupAccess.customDomain.helpText')}
          </Heading>
        </Layout.Horizontal>
        <Layout.Horizontal>
          <Radio
            value="no"
            disabled={!_isEmpty(getServerNames())}
            onChange={e => {
              formikProps.setFieldValue('usingCustomDomain', e.currentTarget.value)
              if (e.currentTarget.value === 'no') {
                setHelpTextSections([])
              }
              formikProps.setFieldValue('customURL', '')
              setGatewayDetails({ ...gatewayDetails, customDomains: [] })
            }}
            checked={formikProps.values.usingCustomDomain === 'no'}
          />
          <Layout.Vertical spacing="xsmall">
            <Text
              color={Color.GREY_500}
              style={{
                fontSize: '12px',
                fontWeight: 400,
                lineHeight: '18px',
                color: 'var(--grey-800)',
                paddingBottom: 'var(--spacing-small)'
              }}
            >
              {getString('ce.co.autoStoppingRule.setupAccess.autogeneratedHelpText')}
            </Text>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Horizontal style={{ width: '100%' }}>
          <Radio
            value="yes"
            onChange={e => {
              formikProps.setFieldValue('usingCustomDomain', e.currentTarget.value)
              debouncedCustomDomainTextChange('', false)
            }}
            checked={formikProps.values.usingCustomDomain === 'yes'}
            className={css.centerAlignedRadio}
            name={'usingCustomDomain'}
          />
          <FormInput.Text
            name="customURL"
            placeholder={getString('ce.co.dnsSetup.customURL')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              formikProps.setFieldValue('customURL', e.target.value)
              debouncedCustomDomainTextChange(e.target.value, true)
            }}
            style={{ width: '100%' }}
            disabled={formikProps.values.usingCustomDomain !== 'yes'}
          />
        </Layout.Horizontal>
        {shouldDisplayPublicAccessCheck() && (
          <Checkbox
            name="publicallyAccessible"
            label={'This url is publicly accessible'}
            onChange={() => {
              const cbVal = Utils.booleanToString(formikProps.values.publicallyAccessible !== 'yes')
              formikProps.setFieldValue('publicallyAccessible', cbVal)
              const updatedGatewayDetails = {
                ...gatewayDetails,
                opts: {
                  ...gatewayDetails.opts,
                  access_details: { ...gatewayDetails.opts.access_details, dnsLink: { public: cbVal } }
                }
              }
              setGatewayDetails(updatedGatewayDetails)
            }}
            checked={formikProps.values.publicallyAccessible === 'yes'}
            className={css.publicAccessibleCheckboxContainer}
          />
        )}
      </Container>
      {formikProps.values.customURL && isAwsProvider && (
        <CustomDomainMapping
          formikProps={formikProps}
          gatewayDetails={gatewayDetails}
          setGatewayDetails={setGatewayDetails}
          hostedZonesList={hostedZonesList}
          setDNSProvider={setDNSProvider}
          setHelpTextSections={setHelpTextSections}
        />
      )}
    </>
  )
}

export default ResourceAccessUrlSelector
