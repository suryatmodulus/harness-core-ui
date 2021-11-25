import React from 'react'
import {
  Button,
  ButtonVariation,
  Color,
  Container,
  FormikForm,
  FormInput,
  Layout,
  Text,
  useModalHook
} from '@wings-software/uicore'
import { Formik } from 'formik'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import css from './useCommentModal.module.scss'

export interface CommentModalProps {
  title?: string
  infoText?: string
  onResolve?: (comment: string) => void
  onReject?: () => void
}

export const CommentModal = (props: CommentModalProps) => {
  const { title, infoText, onResolve, onReject } = props
  const { getString } = useStrings()

  return (
    <Container padding={'xxxlarge'} className={css.main}>
      <Formik<{ comments: string }>
        onSubmit={values => {
          onResolve?.(values.comments)
        }}
        initialValues={{ comments: '' }}
      >
        <FormikForm>
          <Container>
            <Layout.Vertical spacing={'xxlarge'}>
              {title && (
                <Text color={Color.GREY_800} font={{ weight: 'bold', size: 'medium' }}>
                  {title}
                </Text>
              )}
              <Container>
                <Layout.Vertical spacing={'small'}>
                  <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_600}>
                    {getString('common.commentModal.commentLabel')}
                  </Text>
                  <FormInput.TextArea
                    data-name="comments"
                    name="comments"
                    placeholder={getString('common.commentModal.addCommentPlaceholder')}
                  />
                </Layout.Vertical>
              </Container>
              <Container>
                <Layout.Vertical spacing="xxlarge">
                  {infoText && (
                    <Text className={css.infoText} color={Color.GREY_900}>
                      {infoText}
                    </Text>
                  )}
                  <Container>
                    <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                      <Button text={getString('save')} type="submit" variation={ButtonVariation.PRIMARY} />
                      <Button text={getString('cancel')} variation={ButtonVariation.SECONDARY} onClick={onReject} />
                    </Layout.Horizontal>
                  </Container>
                </Layout.Vertical>
              </Container>
            </Layout.Vertical>
          </Container>
        </FormikForm>
      </Formik>
    </Container>
  )
}

export default function useCommentModal(): {
  getComments: (dialogTitle?: string, dialogInfo?: string) => Promise<string>
} {
  const [modalProps, setModalProps] = React.useState<{
    title?: string
    infoText?: string
    resolve: (comment: string) => void
    reject: () => void
  }>()
  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog enforceFocus={false} isOpen={true} className={css.commentsDialog}>
        <CommentModal
          title={modalProps?.title}
          infoText={modalProps?.infoText}
          onResolve={modalProps?.resolve}
          onReject={modalProps?.reject}
        />
        a
      </Dialog>
    )
  }, [modalProps])

  const getComments: (dialogTitle?: string, dialogInfo?: string) => Promise<string> = (
    dialogTitle?: string,
    dialogInfo?: string
  ) => {
    return new Promise((resolve, reject) => {
      setModalProps({
        title: dialogTitle,
        infoText: dialogInfo,
        resolve: (comment: string) => {
          hideModal()
          resolve(comment)
        },
        reject: () => {
          hideModal()
          reject()
        }
      })
      showModal()
    })
  }
  return { getComments }
}
