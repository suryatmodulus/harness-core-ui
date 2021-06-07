import React, { useState } from 'react'
import { Text, Layout, Formik, FormikForm as Form, Button, Color, FormInput } from '@wings-software/uicore'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
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
      formName="selectCreatePipeline"
    >
      <Form>
        <Text color={Color.BLACK} padding={{ bottom: 8 }} font={{ weight: 'bold', size: 'large' }}>
          {getString('pipeline.selectOrCreatePipeline.setupHeader')}
        </Text>
        <Text font={{ size: 'normal' }} color={Color.BLACK} padding={{ bottom: 40 }}>
          {getString('common.letsGetYouStarted')}
        </Text>
        <Layout.Vertical padding={{ top: 'large', bottom: 'small' }} spacing="small">
          <Text font={{ size: 'normal' }} color={Color.BLACK}>
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
            alignText={'center'}
            padding={'small'}
            width={200}
            height={33}
            inline
            border={{ width: 1 }}
            onClick={openCreatPipeLineModal}
          />
        </Layout.Horizontal>
      </Form>
    </Formik>
  )
}
