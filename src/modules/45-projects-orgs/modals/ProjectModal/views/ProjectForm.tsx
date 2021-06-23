import React from 'react'
import {
  Formik,
  FormikForm as Form,
  FormInput,
  Button,
  Text,
  Layout,
  StepProps,
  SelectOption,
  Container,
  Color,
  ModalErrorHandler,
  ModalErrorHandlerBinding
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { DescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import type { Project } from 'services/cd-ng'
import ProjectCard from '@projects-orgs/components/ProjectCard/ProjectCard'
import { DEFAULT_COLOR } from '@common/constants/Utils'
import { useStrings } from 'framework/strings'
import { NameSchema, IdentifierSchema } from '@common/utils/Validation'
import css from './Steps.module.scss'

interface ProjectModalData {
  data?: Project
  disableSelect: boolean
  disableSubmit: boolean
  enableEdit: boolean
  title: string
  initialOrgIdentifier: string
  initialModules?: Project['modules']
  onComplete: (project: Project) => Promise<void>
  organizationItems: SelectOption[]
  setModalErrorHandler: (modalErrorHandler: ModalErrorHandlerBinding) => void
  displayProjectCardPreview?: boolean
}

interface AboutPageData extends Project {
  preview?: boolean
}

const ProjectForm: React.FC<StepProps<Project> & ProjectModalData> = props => {
  const {
    data: projectData,
    title,
    enableEdit,
    onComplete,
    disableSelect,
    disableSubmit,
    organizationItems,
    initialOrgIdentifier,
    initialModules,
    setModalErrorHandler,
    displayProjectCardPreview = true
  } = props
  const { getString } = useStrings()

  return (
    <Formik
      initialValues={{
        color: DEFAULT_COLOR,
        identifier: '',
        name: '',
        orgIdentifier: initialOrgIdentifier,
        modules: initialModules,
        description: '',
        tags: {},
        ...projectData
      }}
      formName="projectsForm"
      enableReinitialize={true}
      validationSchema={Yup.object().shape({
        name: NameSchema(),
        identifier: IdentifierSchema(),
        orgIdentifier: Yup.string().required(getString('validation.orgValidation'))
      })}
      onSubmit={(values: AboutPageData) => {
        onComplete(values)
      }}
    >
      {formikProps => {
        return (
          <Form>
            <Layout.Horizontal>
              <Layout.Vertical width={displayProjectCardPreview ? '50%' : '100%'} padding="xxlarge">
                <Container style={{ minHeight: '450px' }}>
                  <Layout.Horizontal padding={{ bottom: 'large' }}>
                    <Text font="medium" color={Color.BLACK}>
                      {title}
                    </Text>
                  </Layout.Horizontal>
                  <ModalErrorHandler bind={setModalErrorHandler} />
                  <FormInput.InputWithIdentifier isIdentifierEditable={enableEdit} />
                  <Layout.Horizontal spacing="small" margin={{ bottom: 'xsmall' }}>
                    <FormInput.ColorPicker label={getString('color')} name="color" height={38} />
                    <FormInput.Select
                      label={getString('orgLabel')}
                      name="orgIdentifier"
                      items={organizationItems}
                      disabled={disableSelect}
                    />
                  </Layout.Horizontal>
                  <DescriptionTags formikProps={formikProps} />
                </Container>
                <Layout.Horizontal>
                  <Button intent="primary" text={getString('saveAndContinue')} type="submit" disabled={disableSubmit} />
                </Layout.Horizontal>
              </Layout.Vertical>
              {displayProjectCardPreview && (
                <Container width="50%" flex={{ align: 'center-center' }} className={css.preview}>
                  <ProjectCard data={{ projectResponse: { project: formikProps.values } }} isPreview={true} />
                </Container>
              )}
            </Layout.Horizontal>
          </Form>
        )
      }}
    </Formik>
  )
}

export default ProjectForm
