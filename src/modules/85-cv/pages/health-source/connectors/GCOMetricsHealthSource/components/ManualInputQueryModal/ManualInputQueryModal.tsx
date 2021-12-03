import React from 'react'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { object as yupObject, string as yupString } from 'yup'
import { Button, Container, Formik, FormikForm, FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import css from './ManualInputQueryModal.module.scss'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'

interface UseManualInputQueryModalProps {
  onSubmit: (values: { metricName: string; identifier: string }) => void
  manuallyInputQueries?: string[]
  closeModal: () => void
}

export const MANUAL_INPUT_QUERY = 'ManualInputQuery'

export const FieldNames = {
  METRIC_NAME: 'metricName',
  IDENTIFIER: 'identifier'
}

const DialogOptions: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: false,
  style: { width: 500 },
  className: 'ManualInputModal'
}

function getValidatitionSchema(getString: UseStringsReturn['getString'], manuallyInputQueries?: string[]) {
  return yupObject().shape({
    [FieldNames.METRIC_NAME]: yupString()
      .required(getString('cv.monitoringSources.metricNameLabel'))
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
      }),
    [FieldNames.IDENTIFIER]: yupString().trim().required(getString('validation.identifierRequired'))
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
        <Formik
          onSubmit={values => {
            onSubmit(values)
            closeModal()
          }}
          formName="manualInputQuery"
          initialValues={{ metricName: '' }}
          validationSchema={getValidatitionSchema(getString, manuallyInputQueries)}
        >
          <FormikForm className={css.form}>
            <NameId
              nameLabel={getString('cv.monitoringSources.metricNameLabel')}
              identifierProps={{
                inputName: FieldNames.METRIC_NAME,
                idName: FieldNames.IDENTIFIER
              }}
            />
            <Container className={css.buttonContainer}>
              <Button onClick={() => closeModal()}>{getString('cancel')}</Button>
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
