import React, { Dispatch, useState, SetStateAction } from 'react'
import * as Yup from 'yup'
import { noop } from 'lodash-es'
import type { FormikProps } from 'formik'

import { Formik, Layout, FormikForm, FormInput, Heading, Color, Button, Icon } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import type { TemplateResponseDTO } from 'services/template-ng'
import { DescriptionTags, NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { getAllowedTemplateTypes, TemplateType } from '@templates-library/utils/templatesUtils'

import { TemplateCard } from '../TemplateCard/TemplateCard'
import css from './CreateTemplateModal.module.scss'

export interface CreateModalProps {
  initialValues: TemplateResponseDTO
  onClose: () => void
}

interface BasicDetailsInterface extends CreateModalProps {
  setPreviewValues: Dispatch<SetStateAction<TemplateResponseDTO>>
}

interface PreviewInterface extends CreateModalProps {
  previewValues: TemplateResponseDTO
}

const BasicTemplateDetails = (props: BasicDetailsInterface) => {
  const { getString } = useStrings()
  const allowedTemplateTypes = getAllowedTemplateTypes(getString)

  const getCreateModalTitle = (createTemplateType?: string): string => {
    if (!createTemplateType) {
      return ''
    }
    // Dialog heading: Create New Step Template
    const templateTypeString = allowedTemplateTypes.find(templ => templ.value === createTemplateType)?.label
    return `${getString('templatesLibrary.createNewModal.headingPrefix')} ${templateTypeString} ${getString(
      'templatesLibrary.createNewModal.headingSuffix'
    )}`
  }
  const currentTemplateType = props.initialValues.templateEntityType
  return (
    <div className={css.basicDetails}>
      <Heading
        level={2}
        color={Color.GREY_800}
        font={{ weight: 'semi-bold' }}
        margin={{ top: 'medium', bottom: 'xlarge', left: 0, right: 0 }}
      >
        {getCreateModalTitle(currentTemplateType)}
      </Heading>
      <Formik
        initialValues={props.initialValues}
        onSubmit={noop}
        validate={values => props.setPreviewValues(values)}
        formName={`createTemplate${currentTemplateType}`}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(getString('templatesLibrary.createNewModal.validation.name'))
        })}
      >
        {(formik: FormikProps<TemplateResponseDTO>) => {
          return (
            <FormikForm>
              <div className={css.lg}>
                <NameId dataTooltipId={`createTemplate${currentTemplateType}`} />
              </div>
              <div className={css.lg}>
                <FormInput.Text name="label" label={getString('templatesLibrary.createNewModal.label')} />
              </div>
              <div className={css.lg}>
                <FormInput.CheckBox
                  name="stableTemplate"
                  label={getString('templatesLibrary.createNewModal.defaultLabel')}
                />
              </div>
              <div className={css.lg}>
                <DescriptionTags formikProps={formik} />
              </div>

              <Layout.Horizontal spacing="small" margin={{ top: 'huge' }}>
                <Button text={getString('create')} type="submit" intent="primary" />
                <Button text={getString('cancel')} intent="none" onClick={props.onClose} />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </div>
  )
}

const TemplatePreview = (previewProps: PreviewInterface) => {
  return (
    <Layout.Vertical>
      <div className={css.closeIcon}>
        <Icon name="cross" size={20} onClick={previewProps.onClose} />
      </div>
      <div className={css.preview}>
        <TemplateCard
          template={{
            templateType: previewProps.previewValues.templateEntityType as TemplateType,
            ...previewProps.previewValues
          }}
          onSelect={noop}
        />
      </div>
    </Layout.Vertical>
  )
}

export const CreateTemplateModal = (props: CreateModalProps) => {
  const [previewValues, setPreviewValues] = useState<TemplateResponseDTO>(props.initialValues)
  return (
    <Layout.Horizontal>
      <BasicTemplateDetails {...props} setPreviewValues={setPreviewValues} />
      <TemplatePreview {...props} previewValues={previewValues} />
    </Layout.Horizontal>
  )
}
