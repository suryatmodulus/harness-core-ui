import React, { useState } from 'react'
import cx from 'classnames'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { Classes } from '@blueprintjs/core'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { Container, Layout, Label, useModalHook, Button, Formik, FormInput, FormikForm } from '@wings-software/uicore'
import { useCreateReportSetting, useUpdateReportSetting } from 'services/ce'
import { useStrings } from 'framework/strings'
import { regexEmail } from '@common/utils/StringUtils'

import type { Report } from './PerspectiveReportsAndBudgets'
import Cron from './Cron'
import css from './PerspectiveCreateReport.module.scss'

export interface ReportDetailsForm {
  name: string
  recipients: string
  cron: string
}

interface OpenModalArgs {
  isEdit?: boolean
  selectedReport?: Report
}

interface CreateReportModalProps {
  onSuccess?: () => void
  onError?: () => void
}

const useCreateReportModal = ({ onSuccess, onError }: CreateReportModalProps) => {
  const { getString } = useStrings()
  const [isEditMode, setIsEditMode] = useState(false)
  const [report, setReport] = useState<Report>()
  const { perspectiveId, accountId } = useParams<{ perspectiveId: string; accountId: string }>()
  const { mutate: createReport } = useCreateReportSetting({ accountId })
  const { mutate: updateReport } = useUpdateReportSetting({ accountId })
  const modalPropsLight: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    enforceFocus: false,
    className: cx(Classes.DIALOG, css.mainCtn)
  }

  const handleSubmit = async (data: ReportDetailsForm): Promise<void> => {
    const { cron, recipients, name } = data
    const payload = {
      viewsId: [perspectiveId],
      name: name,
      userCron: `0 ${cron}`,
      recipients: recipients.split(',').map((s: string) => s.trim())
    }

    try {
      await (isEditMode ? updateReport({ ...payload, uuid: report?.uuid }) : createReport(payload))
      onSuccess?.()
    } catch (e) {
      onError?.()
    }
  }

  const getSchemaValidations = () => {
    return Yup.object().shape({
      name: Yup.string().required(getString('ce.perspectives.validations.reportNameRequired')),
      recipients: Yup.string()
        .required(getString('ce.perspectives.validations.emailRequired'))
        .test(
          'emails',
          getString('ce.perspectives.validations.invalidEmails'),
          value =>
            value &&
            value
              .split(',')
              .map((s: string) => s.trim())
              .every((v: string) => regexEmail.test(v))
        )
    })
  }

  const getInitialValues = (): ReportDetailsForm => {
    if (!isEditMode) {
      return {
        name: '',
        recipients: '',
        cron: ''
      }
    }

    return {
      name: report?.name || '',
      cron: report?.userCron?.split(' ').slice(1).join(' ') || '',
      recipients: report?.recipients?.join(', ') || ''
    }
  }

  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog onClose={hideModal} {...modalPropsLight}>
        <Container padding="xlarge">
          <Formik<ReportDetailsForm>
            onSubmit={data => {
              handleSubmit(data)
            }}
            formName="createReportScheduleForm"
            enableReinitialize={true}
            initialValues={getInitialValues()}
            validationSchema={getSchemaValidations()}
          >
            {formikProps => {
              return (
                <FormikForm>
                  <Layout.Vertical spacing="xlarge">
                    <Container style={{ minHeight: 300 }}>
                      <FormInput.Text name={'name'} label={getString('name')} />
                      <Container margin={{ top: 'xlarge', bottom: 'xlarge' }}>
                        <Label className={css.cronLabel}>{getString('ce.perspectives.reports.cronLabel')}</Label>
                        <Cron
                          cron={formikProps.values.cron}
                          onChange={cron => formikProps.setFieldValue('cron', cron)}
                        />
                      </Container>
                      <FormInput.TextArea
                        placeholder={getString('ce.perspectives.reports.emailPlaceholder')}
                        className={css.recipients}
                        name={'recipients'}
                        label={getString('ce.perspectives.reports.recipientLabel')}
                      />
                    </Container>
                    <Layout.Horizontal spacing="medium">
                      <Button type="submit" intent="primary" disabled={false}>
                        {getString('save')}
                      </Button>
                      <Button onClick={() => hideModal()} text={getString('cancel')}></Button>
                    </Layout.Horizontal>
                  </Layout.Vertical>
                </FormikForm>
              )
            }}
          </Formik>
        </Container>
      </Dialog>
    ),
    [isEditMode, report]
  )

  return {
    hideModal,
    openModal: (args?: OpenModalArgs) => {
      const { isEdit, selectedReport } = args || {}
      if (typeof isEdit !== 'undefined') {
        setIsEditMode(isEdit)
        setReport(selectedReport)
      }

      openModal()
    }
  }
}

export default useCreateReportModal
