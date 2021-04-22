import React from 'react'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { object as yupObject, string as yupString } from 'yup'
import { Button, Container, Formik, FormikForm, FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import type { UseStringsReturn } from 'framework/strings/String'
import css from './ManualInputQueryModal.module.scss'

interface UseManualInputQueryModalProps {
  onSubmit: (values: { metricName: string }) => void
  manuallyInputQueries?: string[]
  closeModal: () => void
}

export const MANUAL_INPUT_QUERY = 'ManualInputQuery'

export const FieldNames = {
  METRIC_NAME: 'metricName'
}

const DialogOptions: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  style: { width: 500 }
}

function getValidatitionSchema(getString: UseStringsReturn['getString'], manuallyInputQueries?: string[]) {
  return yupObject().shape({
    [FieldNames.METRIC_NAME]: yupString()
      .required(getString('cv.monitoringSources.gco.manualInputQueryModal.validation.metricName'))
      .test({
        name: 'Ensure that input query is unique',
        test: function (value: string) {
          return manuallyInputQueries?.find(metricName => metricName.toLocaleLowerCase() === value?.toLocaleLowerCase())
            ? this.createError({
                message: getString('cv.monitoringSources.gco.manualInputQueryModal.validation.uniqueMetricName', {
                  metricName: value
                })
              })
            : true
        }
      })
  })
}

export function ManualInputQueryModal(props: UseManualInputQueryModalProps): JSX.Element {
  const { onSubmit, manuallyInputQueries, closeModal } = props
  const { getString } = useStrings()
  return (
    <Dialog
      {...DialogOptions}
      onClose={closeModal}
      title={getString('cv.monitoringSources.gco.manualInputQueryModal.modalTitle')}
    >
      <Container className={css.main}>
        {/* <Container className={css.subtitle1Container}>
          <Text color={Color.BLACK} inline className={css.subtitle}>
            {getString('cv.monitoringSources.gco.manualInputQueryModal.subtitle1')}
          </Text>
          <Text color={Color.RED_600} inline className={css.subtitle} style={{ margin: '0 3px' }}>
            {getString('cv.hostNamePlaceholder')}
          </Text>
          <Text color={Color.BLACK} inline className={css.subtitle}>
            {getString('cv.monitoringSources.gco.manualInputQueryModal.subtitle2')}
          </Text>
        </Container>
        <Container>
          <Text color={Color.BLACK} inline className={css.subtitle}>
            {getString('cv.monitoringSources.gco.manualInputQueryModal.subtitle3')}
          </Text>
          <Text color={Color.RED_600} inline className={css.subtitle}>
            {getString('cv.monitoringSources.gco.manualInputQueryModal.exampleString')}
          </Text>
        </Container> */}
        <Formik
          onSubmit={values => {
            onSubmit(values)
            closeModal()
          }}
          initialValues={{ metricName: '' }}
          validationSchema={getValidatitionSchema(getString, manuallyInputQueries)}
        >
          <FormikForm className={css.form}>
            <FormInput.Text
              name={FieldNames.METRIC_NAME}
              label={getString('cv.monitoringSources.gco.mapMetricsToServicesPage.metricNameLabel')}
            />
            <Container className={css.buttonContainer}>
              <Button onClick={() => closeModal()}>{getString('common.cancel')}</Button>
              <Button type="submit" intent="primary">
                {getString('submit')}
              </Button>
            </Container>
          </FormikForm>
        </Formik>
      </Container>
    </Dialog>
  )
}
