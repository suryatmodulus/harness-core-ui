import React from 'react'
import {
  Text,
  useModalHook,
  Button,
  Formik,
  FormikForm as Form,
  Layout,
  Color,
  IconName,
  FormInput
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { useContactSalesModal, ContactSalesFormProps } from '@common/modals/ContactSales/useContactSalesModal'
import { WorkloadSlider } from './WorkloadSlider'
import css from './usePlanModal.module.scss'

export interface PlanModalProps {
  icon: IconName
  module: string
  workloads: number
  premium: boolean
  unitPrice: number
}

interface UsePlanModalProps {
  module: string
  icon: IconName
  unitPrice: number
  contactSalesThreshold: number
  onSubmit: (values: PlanModalProps) => void
  onCloseModal?: () => void
}

interface UsePlanModalReturn {
  openPlanModal: () => void
  closePlanModal: () => void
}

const PlanForm = ({
  onSubmit,
  module,
  icon,
  unitPrice,
  contactSalesThreshold
}: UsePlanModalProps): React.ReactElement => {
  const { openContactSalesModal } = useContactSalesModal({
    onSubmit: (_values: ContactSalesFormProps) => {
      // TO-DO: call the API
    }
  })
  const { getString } = useStrings()
  const validationSchema = Yup.object().shape({
    workloads: Yup.string().trim().required(getString('common.license.planForm.draggable.required'))
  })
  return (
    <Formik
      initialValues={{
        icon,
        module,
        unitPrice,
        workloads: 1,
        premium: true
      }}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={onSubmit}
    >
      {formikProps => {
        return (
          <Form>
            <Layout.Vertical padding={{ bottom: 'xxlarge' }} spacing="small">
              <Text
                icon={formikProps.values.icon}
                iconProps={{ size: 25 }}
                font={{ size: 'medium', weight: 'bold' }}
                color={Color.BLACK}
              >
                {getString('common.license.planForm.title', { module: formikProps.values.module.toUpperCase() })}
              </Text>
              <Text font={{ size: 'small' }}>{getString('common.license.planForm.subtitle')}</Text>
            </Layout.Vertical>
            <Layout.Vertical padding={{ bottom: 'xxlarge' }}>
              <Text font={{ size: 'small' }}>{getString('common.license.planForm.draggable.title')}</Text>
              <WorkloadSlider
                selectedValue={formikProps.values.workloads}
                scale={200}
                width={500}
                onSelected={val => {
                  formikProps.setFieldValue('workloads', val)
                }}
              />
            </Layout.Vertical>

            <Layout.Vertical width={500} className={css.premium} padding={'medium'}>
              <FormInput.CheckBox
                font={{ size: 'small', weight: 'semi-bold' }}
                label={getString('common.license.planForm.premium.checkbox')}
                name="premium"
                className={css.checkbox}
              />
              <Text font={{ size: 'small' }}>{getString('common.license.planForm.premium.description')}</Text>
            </Layout.Vertical>

            <Layout.Vertical padding={{ top: 'xxlarge', bottom: 'xxlarge' }} spacing="small">
              <Text font={{ size: 'small' }}>
                {formikProps.values.workloads < 100
                  ? getString('common.license.planForm.payment.description', { unitPrice: unitPrice })
                  : getString('common.license.planForm.payment.contactSales')}
              </Text>
              <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
                {getString('common.license.planForm.payment.price', {
                  price: formikProps.values.unitPrice * formikProps.values.workloads
                })}
              </Text>
            </Layout.Vertical>

            <Layout.Horizontal spacing={'large'}>
              {formikProps.values.workloads < contactSalesThreshold && (
                <Button intent="primary" text={getString('common.license.planForm.continue')} type="submit" />
              )}
              <Button
                border={{ width: 1, color: Color.PRIMARY_7 }}
                onClick={openContactSalesModal}
                intent="none"
                text={getString('common.license.planForm.contactSales')}
              />
            </Layout.Horizontal>
          </Form>
        )
      }}
    </Formik>
  )
}

export const usePlanModal = ({
  onCloseModal,
  onSubmit,
  module,
  icon,
  unitPrice,
  contactSalesThreshold
}: UsePlanModalProps): UsePlanModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        onClose={() => {
          hideModal(), onCloseModal?.()
        }}
        className={cx(css.dialog, Classes.DIALOG, css.planForm)}
      >
        <PlanForm
          onSubmit={onSubmit}
          module={module}
          icon={icon}
          unitPrice={unitPrice}
          contactSalesThreshold={contactSalesThreshold}
        />
        <Button
          aria-label="close modal"
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideModal(), onCloseModal?.()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    []
  )

  return {
    openPlanModal: showModal,
    closePlanModal: hideModal
  }
}
