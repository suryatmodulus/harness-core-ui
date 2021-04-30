import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Button,
  Container,
  Layout,
  useModalHook,
  FormInput,
  Text,
  Color,
  Formik,
  Avatar,
  Collapse,
  IconName
} from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { useCreateSegment, Tag, CreateSegmentQueryParams } from 'services/cf'
import { useToaster } from '@common/exports'
import css from './TargetsPage.module.scss'

const collapseProps = {
  collapsedIcon: 'plus' as IconName,
  expandedIcon: 'minus' as IconName,
  isOpen: false,
  isRemovable: false
}

const CollapseHeading: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text}{' '}
    <Text font="small" margin={{ left: 'xsmall' }} color={Color.GREY_300}>
      (optional)
    </Text>
  </>
)

const identity = (x: any) => x as string

type SegmentAttributes = {
  identifier: string
  name: string
  description: string
  tags: Tag[]
}

interface CreateTargetSegmentProps {
  project: string
  environment: string
  onCreate: () => void
}

const CreateTargetSegmentModal: React.FC<CreateTargetSegmentProps> = ({ project, environment, onCreate }) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { orgIdentifier, accountId } = useParams<Record<string, string>>()
  const init: SegmentAttributes = { identifier: '', name: '', description: '', tags: [] }

  const { mutate: createSegment } = useCreateSegment({
    queryParams: { account: accountId, accountIdentifier: accountId, org: orgIdentifier } as CreateSegmentQueryParams
  })

  const handleCreateSegment = (values: SegmentAttributes) => {
    createSegment({
      ...values,
      environment,
      project
    })
      .then(hideModal)
      .then(onCreate)
      .catch(() => {
        showError('Error creating segment')
      })
  }

  const [openModal, hideModal] = useModalHook(() => {
    return (
      <Dialog isOpen onClose={hideModal} title={getString('cf.segments.modalTitle')} style={{ padding: 'none' }}>
        <Formik initialValues={init} onSubmit={handleCreateSegment} onReset={hideModal}>
          {formikProps => {
            const handleSubmit = () => formikProps.handleSubmit()
            return (
              <Layout.Horizontal>
                <Container width="65%" padding="medium">
                  <Layout.Vertical spacing="medium">
                    <FormInput.InputWithIdentifier
                      inputName="name"
                      idName="identifier"
                      isIdentifierEditable
                      inputLabel={getString('name')}
                    />
                    <div className={css.collapse}>
                      <Collapse {...collapseProps} heading={<CollapseHeading text="Description" />}>
                        <FormInput.TextArea name="description" />
                      </Collapse>
                    </div>
                    <div className={css.collapse}>
                      <Collapse {...collapseProps} heading={<CollapseHeading text="Tags" />}>
                        <FormInput.TagInput
                          name="tags"
                          label=""
                          items={[]}
                          labelFor={identity}
                          itemFromNewTag={identity}
                          tagInputProps={{
                            showClearAllButton: true,
                            allowNewTag: true,
                            placeholder: 'Tags'
                          }}
                        />
                      </Collapse>
                    </div>
                    <div style={{ paddingTop: 'var(--spacing-xxxlarge)' }}>
                      <Layout.Horizontal spacing="small" style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Button text="Create" onClick={handleSubmit} intent="primary" />
                        <Button text="Cancel" onClick={formikProps.handleReset} minimal />
                      </Layout.Horizontal>
                    </div>
                  </Layout.Vertical>
                </Container>
                <Container width="35%" padding="medium">
                  <Layout.Vertical
                    spacing="small"
                    style={{ alignItems: 'center', justifyContent: 'flex-start', height: '100%' }}
                  >
                    <Text>{getString('cf.segments.displayIcon')}</Text>
                    <Avatar name={formikProps.values.name || 'Segment'} size="large" />
                    <Text>{getString('cf.segments.uploadImage')}</Text>
                  </Layout.Vertical>
                </Container>
              </Layout.Horizontal>
            )
          }}
        </Formik>
      </Dialog>
    )
  }, [])

  return <Button intent="primary" text={getString('cf.segments.create')} onClick={openModal} />
}

export default CreateTargetSegmentModal
