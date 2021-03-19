import React from 'react'
import { Container, Text, Card, CardBody, Color } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import type { FormikProps } from 'formik'
import { NameIdDescriptionTags } from '@common/components'
import { SetupSourceCardHeader, SetupSourceCardHeaderProps } from '../SetupSourceCardHeader/SetupSourceCardHeader'
import css from './DefineYourMonitoringSource.module.scss'

export interface DefineYourMonitoringSourceProps extends SetupSourceCardHeaderProps {
  sourceIcon: IconProps
  iconLabel: string
  formikProps: FormikProps<any>
}

export function DefineYourMonitoringSource(props: DefineYourMonitoringSourceProps): JSX.Element {
  const { sourceIcon, iconLabel, formikProps, ...defineYourSourceProps } = props
  return (
    <Container className={css.defineMonitoringSource}>
      <SetupSourceCardHeader {...defineYourSourceProps} />
      <Container className={css.monitoringSourceContent}>
        <Card selected={true} className={css.sourceIcon}>
          <CardBody.Icon icon={sourceIcon.name} iconSize={sourceIcon.size || 40} />
          <Text color={Color.BLACK}>{iconLabel}</Text>
        </Card>
        <NameIdDescriptionTags formikProps={formikProps} identifierProps={{ inputName: 'monitoringSourceName' }} />
      </Container>
    </Container>
  )
}
