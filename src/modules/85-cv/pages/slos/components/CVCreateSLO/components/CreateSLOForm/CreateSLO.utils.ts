import type { FormikProps } from 'formik'
import type { StringKeys } from 'framework/strings'
import type { ServiceLevelIndicatorDTO, ServiceLevelObjectiveDTO } from 'services/cv'
import { CreateSLOEnum } from './CreateSLO.constants'
import type { SLOForm } from './CreateSLO.types'

export const createSLORequestPayload = (
  values: SLOForm,
  orgIdentifier: string,
  projectIdentifier: string
): ServiceLevelObjectiveDTO => {
  const {
    serviceLevelIndicators: { type = '', spec = {} }
  } = values

  return {
    ...values,
    orgIdentifier,
    projectIdentifier,
    serviceLevelIndicators: [{ type, spec }] as ServiceLevelIndicatorDTO[]
  }
}

export function validateSLOForm(
  formikProps: FormikProps<SLOForm>,
  selectedTabId: CreateSLOEnum,
  getString: (key: StringKeys) => string
): { [key: string]: string } | undefined {
  let errors = {}

  if (selectedTabId === CreateSLOEnum.NAME) {
    errors = validateFieldsInNameTab(formikProps, getString)
  } else if (selectedTabId === CreateSLOEnum.SLI) {
    errors = validateFieldsInSLITab(formikProps, getString)
  }
  return errors
}

export function validateFieldsInNameTab(
  formikProps: FormikProps<SLOForm>,
  getString: (key: StringKeys) => string
): { [key: string]: string } {
  const errorsInNameTab: { [key: string]: string } = {}

  formikProps.setFieldTouched('name', true)
  formikProps.setFieldTouched('userJourneyRef', true)

  if (!formikProps?.values?.name) {
    errorsInNameTab.name = getString('cv.slos.validations.nameValidation')
  }
  if (!formikProps?.values.userJourneyRef) {
    errorsInNameTab.userJourneyRef = getString('cv.slos.validations.userJourneyRequired')
  }
  return errorsInNameTab
}

export function validateFieldsInSLITab(
  formikProps: FormikProps<SLOForm>,
  getString: (key: StringKeys) => string
): { [key: string]: string } {
  const errorsInSLITab: { [key: string]: string } = {}

  formikProps.setFieldTouched('monitoredServiceRef', true)
  formikProps.setFieldTouched('healthSourceRef', true)

  if (!formikProps?.values?.monitoredServiceRef) {
    errorsInSLITab.monitoredServiceRef = getString('connectors.cdng.validations.monitoringServiceRequired')
  }
  if (!formikProps?.values?.healthSourceRef) {
    errorsInSLITab.healthSourceRef = getString('cv.slos.validations.userJourneyRequired')
  }
  return errorsInSLITab
}
