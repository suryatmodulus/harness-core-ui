import React, { useState } from 'react'
import { Text, Layout, Formik, FormikForm as Form, Button, Color, FormInput } from '@wings-software/uicore'
import * as Yup from 'yup'
import { useStrings } from 'framework/exports'
import PipelineSelect from '@pipeline/components/PipelineSelect/PipelineSelect'
import css from './SelectOrCreatePipelineForm.module.scss'

interface SelectOrCreatePipelineFormProps {
  handleSubmit: (value: string) => void
  closeModal?: () => void
  openCreatPipeLineModal: () => void
}

export const SelectOrCreatePipelineForm: React.FC<SelectOrCreatePipelineFormProps> = props => {
  const { getString } = useStrings()
  const [select, setSelect] = useState('')
  const { openCreatPipeLineModal, handleSubmit, closeModal } = props
  return (
    <Formik
      initialValues={{
        selectedPipeline: select,
        pipelineRequired: select
      }}
      validationSchema={Yup.object().shape({
        pipelineRequired: Yup.string()
          .trim()
          .required(getString('pipeline.selectOrCreatePipeline.pipelineNameRequired'))
      })}
      enableReinitialize={true}
      onSubmit={() => {
        handleSubmit(select)
        closeModal?.()
      }}
    >
      <Form>
        <Text style={{ color: Color.BLACK, paddingBottom: 8, fontWeight: 600, fontSize: 'large' }}>
          {getString('pipeline.selectOrCreatePipeline.setupHeader')}
        </Text>
        <Text style={{ fontSize: 'normal', color: Color.BLACK, paddingBottom: 40 }}>
          {getString('common.letsGetYouStarted')}
        </Text>
        <Layout.Vertical padding={{ top: 'large', bottom: 'small' }} spacing="small">
          <Text style={{ fontSize: 'normal', color: Color.BLACK }}>
            {getString('pipeline.selectOrCreatePipeline.selectAPipeline')}
          </Text>
          <PipelineSelect
            onPipelineSelect={value => setSelect(value)}
            selectedPipeline={select}
            defaultSelect={' '}
            className={css.select}
          />
          {/* this FormInput is for Continue button validation use only */}
          <FormInput.Text name="pipelineRequired" className={css.pipelineRequired} />
        </Layout.Vertical>
        <Layout.Horizontal padding={{ top: 'large' }} spacing="medium">
          <Button intent="primary" text={getString('continue')} type="submit" />
          <Button
            text={getString('pipeline.createANewPipeline')}
            style={{
              color: 'var(--blue-600)',
              textAlign: 'center',
              padding: 7,
              width: 150,
              height: 33,
              display: 'inline-block',
              borderWidth: 1,
              borderColor: 'var(--blue-600)'
            }}
            onClick={openCreatPipeLineModal}
          />
        </Layout.Horizontal>
      </Form>
    </Formik>
  )
}
