import React from 'react'
import type { FormikProps } from 'formik'
import { Color, Container } from '@wings-software/uicore'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'

export default function MonitoredServiceDetails({ formik }: { formik: FormikProps<any> }) {
  const { getString } = useStrings()
  return (
    <CardWithOuterTitle title={getString('cv.monitoredServices.monitoredServiceDetails')}>
      <Container width={'400px'} color={Color.BLACK}>
        <NameIdDescriptionTags
          formikProps={formik}
          identifierProps={{
            isIdentifierEditable: !formik?.values?.isEdit,
            inputLabel: getString('cv.monitoredServices.monitoredServiceName')
          }}
        />
      </Container>
    </CardWithOuterTitle>
  )
}
