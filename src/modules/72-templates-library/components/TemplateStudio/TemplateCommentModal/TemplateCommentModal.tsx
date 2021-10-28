import React from 'react'
import { Button, ButtonVariation, Color, Container, FormikForm, FormInput, Layout, Text } from '@wings-software/uicore'
import { Formik } from 'formik'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import css from './TemplateCommentModal.module.scss'

export interface UpdateTemplateModalProps {
  title: string
  onClose: () => void
  onSubmit: (comment: string) => void
}

export const TemplateCommentModal = (props: UpdateTemplateModalProps) => {
  const { title, onSubmit, onClose } = props
  const { getString } = useStrings()
  const { isGitSyncEnabled } = useAppStore()

  return (
    <Container padding={'xxxlarge'} className={css.main}>
      <Formik<{ comments: string }>
        onSubmit={values => {
          onSubmit(values.comments)
        }}
        initialValues={{ comments: '' }}
      >
        <FormikForm>
          <Container>
            <Layout.Vertical spacing={'xxlarge'}>
              <Text color={Color.GREY_800} font={{ weight: 'bold', size: 'medium' }}>
                {title}
              </Text>
              <Container>
                <Layout.Vertical spacing={'small'}>
                  <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_600}>
                    {getString('templatesLibrary.updateTemplateModal.commentLabel')}
                  </Text>
                  <FormInput.TextArea
                    data-name="comments"
                    name="comments"
                    placeholder={getString('templatesLibrary.updateTemplateModal.addCommentPlaceholder')}
                  />
                </Layout.Vertical>
              </Container>
              <Container>
                <Layout.Vertical spacing="small">
                  <Container>
                    <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                      <Button
                        text={isGitSyncEnabled ? getString('continue') : getString('save')}
                        type="submit"
                        variation={ButtonVariation.PRIMARY}
                      />
                      <Button text={getString('cancel')} variation={ButtonVariation.SECONDARY} onClick={onClose} />
                    </Layout.Horizontal>
                  </Container>
                  <Text color={Color.GREY_400} font={{ size: 'xsmall', weight: 'semi-bold' }}>
                    {getString('templatesLibrary.updateTemplateModal.info')}
                  </Text>
                </Layout.Vertical>
              </Container>
            </Layout.Vertical>
          </Container>
        </FormikForm>
      </Formik>
    </Container>
  )
}
