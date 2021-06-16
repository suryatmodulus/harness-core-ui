import React, { useState } from 'react'
import {
  Formik,
  FormikForm as Form,
  FormInput,
  Layout,
  Container,
  StepProps,
  Button,
  Collapse,
  Text,
  Utils,
  Color
} from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import type { IconName } from '@blueprintjs/core'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { illegalIdentifiers } from '@common/utils/StringUtils'
import css from './FlagElemAbout.module.scss'

const collapseProps = {
  collapsedIcon: 'plus' as IconName,
  expandedIcon: 'minus' as IconName,
  isOpen: false,
  isRemovable: false
}

interface FlagElemAboutProps {
  goBackToTypeSelections: () => void
}

type AboutFormProps = FormikProps<any> & FlagElemAboutProps & { isEdit: boolean }

const AboutForm: React.FC<AboutFormProps> = props => {
  const { getString } = useStrings()
  const [descOpened, setDescOpened] = useState<boolean>(Boolean(props.values.description.length))
  // const [tagsOpened, setTagsOpened] = useState<boolean>(Boolean(props.values.tags.length))
  return (
    <Form>
      <Container className={css.aboutFlagContainer}>
        <Container style={{ flexGrow: 1, overflow: 'auto' }}>
          <Text style={{ fontSize: '18px', color: Color.GREY_700 }} margin={{ bottom: 'xlarge' }}>
            {getString('cf.creationModal.aboutFlag.aboutFlagHeading')}
          </Text>
          <Container margin={{ bottom: 'large' }} width="60%">
            <FormInput.InputWithIdentifier
              inputName="name"
              idName="identifier"
              isIdentifierEditable={true}
              inputGroupProps={{
                placeholder: getString('cf.creationModal.aboutFlag.ffNamePlaceholder'),
                inputGroup: { autoFocus: true }
              }}
            />
          </Container>
          <Container>
            <div className={css.optionalCollapse}>
              <Collapse
                {...collapseProps}
                onToggleOpen={setDescOpened}
                heading={getString('description')}
                isOpen={Boolean(props.values.description.length) || descOpened}
              >
                <FormInput.TextArea name="description" />
              </Collapse>
            </div>
            {/* <div className={css.optionalCollapse}>
              <Collapse
                {...collapseProps}
                onToggleOpen={setTagsOpened}
                heading={getString('cf.creationModal.aboutFlag.tagsOptional')}
                isOpen={Boolean(props.values.tags.length) || tagsOpened}
              >
                <FormInput.TagInput
                  name="tags"
                  label={''}
                  items={[]}
                  labelFor={nameLabel => nameLabel as string}
                  itemFromNewTag={newTag => newTag}
                  tagInputProps={{
                    showClearAllButton: true,
                    allowNewTag: true,
                    placeholder: getString('cf.creationModal.aboutFlag.tagsPlaceholder')
                  }}
                />
              </Collapse>
            </div> */}
          </Container>
          <Container margin={{ top: 'xlarge' }}>
            <Layout.Horizontal>
              <FormInput.CheckBox name="permanent" label={getString('cf.creationModal.aboutFlag.permaFlag')} />
              <Text
                margin={{ left: 'xsmall' }}
                tooltip={getString('cf.creationModal.aboutFlag.permaFlagTooltip')}
                tooltipProps={{
                  isDark: true,
                  portalClassName: css.tooltipAboutFlag
                }}
                inline
              />
            </Layout.Horizontal>
          </Container>
        </Container>
        <Layout.Horizontal spacing="small" margin={{ top: 'large' }}>
          <Button
            type="button"
            text={getString('back')}
            onMouseDown={e => {
              Utils.stopEvent(e)
              props.goBackToTypeSelections()
            }}
          />
          <Button
            type="submit"
            intent="primary"
            rightIcon="chevron-right"
            text={getString('next')}
            onClick={() => props.handleSubmit()}
          />
        </Layout.Horizontal>
      </Container>
    </Form>
  )
}

// FIXME: Change any for StepProps
const FlagElemAbout: React.FC<StepProps<any> & FlagElemAboutProps> = props => {
  const { getString } = useStrings()
  const { nextStep, prevStepData, goBackToTypeSelections } = props
  const isEdit = Boolean(prevStepData)

  return (
    <>
      <Formik
        initialValues={{
          name: '',
          identifier: '',
          description: '',
          tags: [],
          permanent: false,
          ...prevStepData
        }}
        formName="cfFlagElem"
        validationSchema={Yup.object().shape({
          name: Yup.string().trim().required(getString('cf.creationModal.aboutFlag.nameRequired')),
          identifier: Yup.string()
            .trim()
            .required(getString('cf.creationModal.aboutFlag.idRequired'))
            .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('cf.creationModal.aboutFlag.ffRegex'))
            .notOneOf(illegalIdentifiers)
        })}
        onSubmit={vals => {
          nextStep?.({ ...vals })
        }}
      >
        {formikProps => <AboutForm {...formikProps} isEdit={isEdit} goBackToTypeSelections={goBackToTypeSelections} />}
      </Formik>
    </>
  )
}

export default FlagElemAbout
