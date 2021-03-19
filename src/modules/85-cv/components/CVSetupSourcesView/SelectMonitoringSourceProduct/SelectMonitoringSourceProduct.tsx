import React from 'react'
import { FormInput, Layout, Container, Text, Color, Card, CardBody } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { useStrings } from 'framework/exports'
import { StepLabelProps, StepLabel } from '../StepLabel/StepLabel'
import { SetupSourceEmptyCardHeader } from '../SetupSourceCardHeader/SetupSourceCardHeader'
import css from './SelectMonitoringSourceProduct.module.scss'

export interface SelectMonitoringSourceProductProps {
  products: Array<{ productName: string; icon: IconProps; productLabel: string }>
  stepLabelProps: StepLabelProps
  monitoringSourceName: string
  monitoringSourceEntityName: string
}

export function SelectMonitoringSourceProduct(props: SelectMonitoringSourceProductProps): JSX.Element {
  const { products, stepLabelProps, monitoringSourceEntityName, monitoringSourceName } = props
  const { getString } = useStrings()
  return (
    <Container className={css.main}>
      <SetupSourceEmptyCardHeader>
        <StepLabel {...stepLabelProps} />
        <Text className={css.selectProductText}>
          {getString('cv.onboarding.monitoringSources.selectProduct', {
            type: monitoringSourceName,
            entity: monitoringSourceEntityName
          })}
        </Text>
      </SetupSourceEmptyCardHeader>
      <FormInput.CustomRender
        name="product"
        className={css.productSelection}
        render={formikProps => {
          return (
            <Layout.Horizontal spacing="medium">
              {products?.map((item, index) => {
                return (
                  <Card
                    selected={item.productName === formikProps.values.productName}
                    className={css.sourceIcon}
                    key={index}
                  >
                    <CardBody.Icon icon={item.icon.name} iconSize={item.icon.size} />
                    <Text color={Color.BLACK}>{item.productLabel}</Text>
                  </Card>
                )
              })}
            </Layout.Horizontal>
          )
        }}
      />
    </Container>
  )
}
