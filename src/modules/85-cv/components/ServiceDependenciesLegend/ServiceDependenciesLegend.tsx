import React from 'react'
import { Container, Icon, Text, Color, Spacing, Layout, FontVariation } from '@wings-software/uicore'
import type { MarginProps } from '@wings-software/uicore/dist/styled-props/margin/MarginProps'
import { useStrings } from 'framework/strings'
import { getServicesStates, getServicesTypes } from './ServiceDependenciesLegend.utils'
import css from './ServiceDependenciesLegend.module.scss'

interface ServiceDependenciesLegendProps {
  hideServiceTypeLegend?: boolean
  margin?: Spacing | MarginProps
}

const ServiceDependenciesLegend: React.FC<ServiceDependenciesLegendProps> = ({ hideServiceTypeLegend, margin }) => {
  const { getString } = useStrings()
  const servicesStates = getServicesStates()
  const serviceTypes = getServicesTypes()

  return (
    <Container background={Color.PRIMARY_1} width="fit-content" className={css.container} margin={margin}>
      <Layout.Horizontal flex spacing="medium" height={30} padding={{ left: 'medium', right: 'medium' }}>
        {servicesStates.map(state => (
          <Container flex key={state.labelId}>
            <Container
              width={8}
              height={8}
              margin={{ right: 'xsmall' }}
              className={css.serviceState}
              style={{ backgroundColor: state.color }}
            />
            <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_700}>
              {getString(state.labelId)}
            </Text>
          </Container>
        ))}
      </Layout.Horizontal>

      {!hideServiceTypeLegend && (
        <Layout.Horizontal
          height={30}
          spacing="medium"
          padding={{ left: 'medium', right: 'medium' }}
          flex={{ justifyContent: 'flex-start' }}
          className={css.serviceTypesContainer}
        >
          {serviceTypes.map(type => (
            <Container flex key={type.labelId}>
              <Icon name={type.icon} size={type.size} color={Color.GREY_600} margin={{ right: 'xsmall' }} />
              <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_700}>
                {getString(type.labelId)}
              </Text>
            </Container>
          ))}
        </Layout.Horizontal>
      )}
    </Container>
  )
}

export default ServiceDependenciesLegend
