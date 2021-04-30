import React, { useEffect } from 'react'
import { Button, Container, Layout, useModalHook, FormInput, Formik, Collapse, IconName } from '@wings-software/uicore'
import * as yup from 'yup'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { useCreateSegment, Tag, CreateSegmentQueryParams } from 'services/cf'
import { useToaster } from '@common/exports'
import { getErrorMessage } from '@cf/utils/CFUtils'
import css from './NewSegmentButton.module.scss'

const collapseProps = {
  collapsedIcon: 'plus' as IconName,
  expandedIcon: 'minus' as IconName,
  isOpen: false,
  isRemovable: false
}

interface SegmentFormData {
  identifier: string
  name: string
  description: string
  tags: Tag[]
}

export interface NewSegmentButtonProps {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  environmentIdentifier?: string
  onCreated: (segmentIdentifier: string) => void
}

export const NewSegmentButton: React.FC<NewSegmentButtonProps> = ({
  accountId,
  orgIdentifier,
  projectIdentifier,
  environmentIdentifier,
  onCreated
}) => {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()

  const { mutate: createSegment } = useCreateSegment({
    queryParams: { account: accountId, accountIdentifier: accountId, org: orgIdentifier } as CreateSegmentQueryParams
  })

  const handleCreateSegment = (values: SegmentFormData): void => {
    createSegment({
      ...values,
      environment: environmentIdentifier as string,
      project: projectIdentifier
    })
      .then(() => {
        hideModal()
        onCreated(values.identifier)
      })
      .catch(e => {
        showError(getErrorMessage(e), 0)
      })
  }

  useEffect(() => {
    return () => clear()
  }, [clear])

  const [openModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen
        onClose={hideModal}
        title={getString('cf.segments.modalTitle')}
        style={{ padding: 'none' }}
        className={css.modal}
      >
        <Formik
          initialValues={{ identifier: '', name: '', description: '', tags: [] }}
          onSubmit={handleCreateSegment}
          onReset={hideModal}
          validationSchema={yup.object().shape({
            name: yup.string().trim().required(getString('cf.segments.nameRequired')),
            identifier: yup.string().trim().required(getString('cf.segments.idRequired'))
          })}
          validateOnChange
          validateOnBlur
        >
          {formikProps => {
            const handleSubmit = (): void => formikProps.handleSubmit()
            return (
              <Container padding="large">
                <Layout.Vertical spacing="small">
                  <FormInput.InputWithIdentifier
                    inputName="name"
                    inputGroupProps={{ inputGroup: { autoFocus: true } }}
                    idName="identifier"
                    isIdentifierEditable
                    inputLabel={getString('name')}
                  />
                  <div className={css.collapse}>
                    <Collapse {...collapseProps} heading={getString('description')}>
                      <FormInput.TextArea name="description" />
                    </Collapse>
                  </div>
                  <div className={css.collapse}>
                    <Collapse {...collapseProps} heading={getString('tagsLabel')}>
                      <FormInput.TagInput
                        name="tags"
                        label=""
                        items={[]}
                        labelFor={item => item as string}
                        itemFromNewTag={item => item}
                        tagInputProps={{
                          showClearAllButton: true,
                          allowNewTag: true,
                          placeholder: getString('tagsLabel')
                        }}
                      />
                    </Collapse>
                  </div>
                  <div style={{ paddingTop: 'var(--spacing-xxxlarge)' }}>
                    <Layout.Horizontal spacing="small" style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                      <Button text={getString('create')} onClick={handleSubmit} intent="primary" />
                      <Button text={getString('cancel')} onClick={formikProps.handleReset} minimal />
                    </Layout.Horizontal>
                  </div>
                </Layout.Vertical>
              </Container>
            )
          }}
        </Formik>
      </Dialog>
    )
  }, [])

  return <Button intent="primary" text={getString('cf.segments.create')} onClick={openModal} />
}
