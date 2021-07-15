import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Dialog, Intent } from '@blueprintjs/core'
import {
  Button,
  useModalHook,
  Text,
  ButtonProps,
  Container,
  TextInput,
  Layout,
  FlexExpander,
  Icon,
  Pagination
} from '@wings-software/uicore'
import { CF_DEFAULT_PAGE_SIZE, getErrorMessage, SegmentsSortByField, SortOrder } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import { Segment, useGetTargetAvailableSegments } from 'services/cf'
import { useToaster } from '@common/exports'
import { PageError } from '@common/components/Page/PageError'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import { SegmentRow } from './SegmentRow'
import { NoDataFoundRow } from '../NoDataFoundRow/NoDataFoundRow'

export interface SelectSegmentsModalButtonProps extends Omit<ButtonProps, 'onClick' | 'onSubmit'> {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  environmentIdentifier: string
  targetIdentifier?: string

  modalTitle: string
  submitButtonTitle?: string
  cancelButtonTitle?: string

  onSubmit: (selectedSegments: Segment[]) => Promise<{ error: any } | any>
}

export const SelectSegmentsModalButton: React.FC<SelectSegmentsModalButtonProps> = ({
  accountId,
  orgIdentifier,
  projectIdentifier,
  environmentIdentifier,
  targetIdentifier,
  modalTitle,
  submitButtonTitle,
  cancelButtonTitle,
  onSubmit,
  ...props
}) => {
  const ModalComponent: React.FC = () => {
    const { getString } = useStrings()
    const { showError } = useToaster()
    const [queryString, setQueryString] = useState('')
    const [sortOrder, setSortOrder] = useState(SortOrder.ASCENDING)
    const [sortByField] = useState(SegmentsSortByField.NAME)
    const [pageNumber, setPageNumber] = useState(0)
    const queryParams = useMemo(
      () => ({
        account: accountId,
        accountIdentifier: accountId,
        org: orgIdentifier,
        project: projectIdentifier,
        environment: environmentIdentifier,
        segmentName: queryString,
        sortOrder,
        sortByField,
        pageNumber,
        pageSize: CF_DEFAULT_PAGE_SIZE
      }),
      [queryString, sortOrder, sortByField, pageNumber]
    )
    const {
      data,
      loading: loadingSegments,
      error,
      refetch
    } = useGetTargetAvailableSegments({
      identifier: targetIdentifier as string,
      queryParams,
      lazy: true
    })
    const [checkedSegments, setCheckedSegments] = useState<Record<string, Segment>>({})
    const checkOrUncheckSegment = useCallback(
      (checked: boolean, segment: Segment) => {
        if (checked) {
          checkedSegments[segment.identifier] = segment
        } else {
          delete checkedSegments[segment.identifier]
        }
        setCheckedSegments({ ...checkedSegments })
      },
      [checkedSegments, setCheckedSegments]
    )
    const selectedCounter = Object.keys(checkedSegments || {}).length
    const [submitLoading, setSubmitLoading] = useState(false)
    const handleSubmit = (): void => {
      setSubmitLoading(true)

      try {
        onSubmit(Object.values(checkedSegments))
          .then(() => {
            hideModal()
          })
          .catch(_error => {
            showError(getErrorMessage(_error), 0, 'cf.save.segment.error')
          })
          .finally(() => {
            setSubmitLoading(false)
          })
      } catch (exception) {
        setSubmitLoading(false)
        showError(getErrorMessage(error), 0, 'cf.save.segment.error')
      }
    }

    useEffect(() => {
      refetch()
    }, [queryString, sortOrder, sortByField, pageNumber]) // eslint-disable-line react-hooks/exhaustive-deps

    const loading = loadingSegments || submitLoading

    return (
      <Dialog
        isOpen
        enforceFocus={false}
        onClose={hideModal}
        title={
          <Text
            style={{
              fontWeight: 600,
              fontSize: '14px',
              color: 'var(--black)',
              lineHeight: '20px',
              padding: 'var(--spacing-large) 0 0 var(--spacing-small)'
            }}
          >
            {modalTitle}
          </Text>
        }
        style={{ width: 700, height: 700 }}
      >
        <Layout.Vertical padding={{ top: 'xxlarge', left: 'xxlarge' }} style={{ height: '100%' }}>
          {/* Search Input */}
          <Container padding={{ right: 'xlarge', bottom: 'large' }}>
            <TextInput
              leftIcon="search"
              width="100%"
              placeholder={getString('cf.selectSegmentModal.searchSegmentPlaceholder')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQueryString(e.target.value)}
              autoFocus
            />
          </Container>

          {/* Table view */}
          <Container
            style={{ height: 'calc(100% - 210px)', overflow: 'auto' }}
            margin={{ bottom: 'small', right: 'xxlarge' }}
          >
            {(error && (
              <PageError
                message={getErrorMessage(error)}
                onClick={() => {
                  refetch()
                }}
              />
            )) || (
              <>
                <Layout.Horizontal
                  style={{ position: 'sticky', top: 0, background: 'var(--white)', zIndex: 1 }}
                  padding={{ top: 'xsmall', left: 'large', right: 'huge', bottom: 'small' }}
                >
                  <Text
                    tabIndex={0}
                    role="button"
                    rightIcon={
                      sortByField === SegmentsSortByField.NAME
                        ? sortOrder === SortOrder.ASCENDING
                          ? 'caret-up'
                          : 'caret-down'
                        : undefined
                    }
                    style={{ color: '#4F5162', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => {
                      setSortOrder(previous =>
                        previous === SortOrder.ASCENDING ? SortOrder.DESCENDING : SortOrder.ASCENDING
                      )
                    }}
                  >
                    {getString('cf.shared.segment').toUpperCase()}
                  </Text>
                  <FlexExpander />
                  {/* Disable since backend does not support this info yet
                  <Text style={{ color: '#4F5162', fontSize: '10px', fontWeight: 'bold' }}>
                    {getString('cf.segments.usingSegment').toLocaleUpperCase()}
                  </Text> */}
                </Layout.Horizontal>

                <Layout.Vertical
                  spacing="small"
                  padding={{ top: 'xsmall', right: 'xsmall', bottom: 'large' }}
                  style={{ paddingLeft: '1px' }}
                >
                  {!!data?.segments?.length &&
                    data?.segments?.map(segment => (
                      <SegmentRow
                        key={segment.identifier}
                        segment={segment}
                        checked={false}
                        onChecked={checkOrUncheckSegment}
                      />
                    ))}
                  {data?.segments?.length === 0 && (
                    <NoDataFoundRow message={getString('cf.selectSegmentModal.empty')} />
                  )}
                </Layout.Vertical>
              </>
            )}
          </Container>

          {/* Pagination */}
          <Container margin={{ right: 'xxlarge' }} height={47}>
            {!error && (
              <Pagination
                itemCount={data?.itemCount || 0}
                pageCount={data?.pageCount || 0}
                pageIndex={data?.pageIndex}
                pageSize={CF_DEFAULT_PAGE_SIZE}
                gotoPage={setPageNumber}
              />
            )}
          </Container>

          {/* Buttons bar */}
          <Layout.Horizontal spacing="small" padding={{ right: 'xxlarge' }} style={{ alignItems: 'center' }}>
            <Button
              text={submitButtonTitle || getString('add')}
              intent={Intent.PRIMARY}
              disabled={loading || !!error || !selectedCounter}
              onClick={handleSubmit}
            />
            <Button text={cancelButtonTitle || getString('cancel')} minimal onClick={hideModal} />
            <FlexExpander />
            {loading && <Icon intent={Intent.PRIMARY} name="spinner" size={16} />}
            {!!selectedCounter && <Text>{getString('cf.shared.selected', { counter: selectedCounter })}</Text>}
          </Layout.Horizontal>
        </Layout.Vertical>
      </Dialog>
    )
  }

  const [openModal, hideModal] = useModalHook(ModalComponent, [])

  return (
    <RbacButton
      permission={{
        resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: environmentIdentifier },
        permission: PermissionIdentifier.EDIT_FF_TARGETGROUP
      }}
      onClick={openModal}
      {...props}
    />
  )
}
