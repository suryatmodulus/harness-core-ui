import React from 'react'
import { Container, FormInput, Heading, Layout, SelectOption, Text } from '@wings-software/uicore'
import { Radio } from '@blueprintjs/core'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import type { GatewayDetails } from '../COCreateGateway/models'
import css from './COGatewayAccess.module.scss'

interface CustomDomainMappingProps {
  formikProps: FormikProps<any>
  gatewayDetails: GatewayDetails
  setGatewayDetails: (details: GatewayDetails) => void
  hostedZonesList: SelectOption[]
  setDNSProvider: (val: string) => void
  setHelpTextSections: (s: string[]) => void
}

const CustomDomainMapping: React.FC<CustomDomainMappingProps> = ({
  formikProps,
  gatewayDetails,
  setGatewayDetails,
  hostedZonesList = [],
  setDNSProvider,
  setHelpTextSections
}) => {
  const { getString } = useStrings()

  return (
    <Container className={css.dnsLinkContainer}>
      <Layout.Vertical spacing="medium">
        <Heading level={3} font={{ weight: 'bold' }}>
          Map your Custom domain to the hostname
        </Heading>
        <Text font={{ weight: 'light' }} color="Color.GREY_500" className={css.mapDomainHelperText}>
          Since you have opted to access instances using a Custom domain, you need to map it to the hostname. Select
          your preferred DNS provider
        </Text>
        <Layout.Vertical>
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
            <Radio
              value="route53"
              checked={formikProps.values.dnsProvider === 'route53'}
              onChange={e => {
                formikProps.setFieldValue('dnsProvider', e.currentTarget.value)
                setDNSProvider(e.currentTarget.value)
                const updatedGatewayDetails = { ...gatewayDetails }
                updatedGatewayDetails.routing = {
                  ...gatewayDetails.routing,
                  custom_domain_providers: { route53: {} } // eslint-disable-line
                }
                setGatewayDetails(updatedGatewayDetails)
                setHelpTextSections(['usingCustomDomain'])
              }}
              name={'route53RadioBtn'}
            />
            <FormInput.Select
              name="route53Account"
              placeholder={getString('ce.co.accessPoint.select.route53')}
              items={hostedZonesList}
              onChange={e => {
                formikProps.setFieldValue('route53Account', e.value)
                const updatedGatewayDetails = { ...gatewayDetails }
                updatedGatewayDetails.routing = {
                  ...gatewayDetails.routing,
                  //eslint-disable-next-line
                  custom_domain_providers: {
                    route53: { hosted_zone_id: e.value as string } // eslint-disable-line
                  }
                }
                setGatewayDetails(updatedGatewayDetails)
              }}
            />
          </Layout.Horizontal>
          <Radio
            value="others"
            checked={formikProps.values.dnsProvider === 'others'}
            label="Others"
            onChange={e => {
              formikProps.setFieldValue('dnsProvider', e.currentTarget.value)
              setDNSProvider(e.currentTarget.value)
              const updatedGatewayDetails = { ...gatewayDetails }
              updatedGatewayDetails.routing = {
                ...gatewayDetails.routing,
                custom_domain_providers: { others: {} } // eslint-disable-line
              }
              setGatewayDetails(updatedGatewayDetails)
              setHelpTextSections(['usingCustomDomain', 'dns-others'])
            }}
          />
        </Layout.Vertical>
      </Layout.Vertical>
    </Container>
  )
}

export default CustomDomainMapping
