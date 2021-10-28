import React, { useState, useEffect, useMemo } from 'react'
import { noop } from 'lodash-es'
import { Layout, Formik, FormikForm, FormInput, Text, Color, Icon, Radio } from '@wings-software/uicore'

import type { CellProps, Renderer, Column } from 'react-table'
import ReactTimeago from 'react-timeago'
import { setPageNumber } from '@common/utils/utils'

import Table from '@common/components/Table/Table'
import { useGetEvaluationList, Evaluation } from 'services/pm'
import { isEvaluationFailed } from '@governance/utils/GovernanceUtils'

import { useStrings } from 'framework/strings'

import css from './SelectInputModal.module.scss'

const RenderPipelineName: Renderer<CellProps<Evaluation>> = ({ row }) => {
  const record = row.original

  return (
    <Layout.Vertical spacing="small">
      <Text color={Color.BLACK} lineClamp={1} font={{ weight: 'semi-bold' }}>
        {record.input?.pipeline?.name}
      </Text>
      <Text color={Color.BLACK} lineClamp={1}>
        {record?.input?.pipeline?.projectIdentifier} / {record?.input?.pipeline?.orgIdentifier}
      </Text>
    </Layout.Vertical>
  )
}

const RenderEvaluatedon: Renderer<CellProps<Evaluation>> = ({ row }) => {
  const record = row.original

  return (
    <Text color={Color.BLACK} lineClamp={1}>
      <ReactTimeago date={record.created as number} />
    </Text>
  )
}

// const RenderPolicySets: Renderer<CellProps<Evaluation>> = ({ row }) => {
//   const record = row.original

//   return (
//     <>
//       {record?.details?.map((data: EvaluationDetail, index: number) => {
//         return (
//           <span key={(data.name || '') + index} className={css.pill}>
//             {data.name}
//           </span>
//         )
//       })}
//     </>
//   )
// }

const RenderAction: Renderer<CellProps<Evaluation>> = ({ row }) => {
  const record = row.original

  return (
    <Text color={Color.BLACK} lineClamp={1}>
      {record?.input?.action === 'onrun' ? 'Run' : 'Save'}
    </Text>
  )
}

const RenderStatus: Renderer<CellProps<Evaluation>> = ({ row }) => {
  const record = row.original

  return (
    <>
      {isEvaluationFailed(record?.status) ? (
        <span className={css.pillDanger}>
          <Icon name="deployment-failed-new" size={12} style={{ marginRight: 'var(--spacing-small)' }} /> FAILED
        </span>
      ) : (
        <span className={css.pillSuccess}>
          <Icon name="tick-circle" size={12} style={{ marginRight: 'var(--spacing-small)' }} /> PASSED
        </span>
      )}
    </>
  )
}

const SelectInputModal: React.FC<{ handleOnSelect: (data: string) => void }> = props => {
  const [page, setPage] = useState(0)

  const { data: evaluationsList } = useGetEvaluationList({})
  const [isEvaluationTableVisible, setEvalTableVisibility] = useState(false)

  const { getString } = useStrings()

  useEffect(() => {
    setPageNumber({ setPage, page, pageItemsCount: 1000 })
  }, [evaluationsList, page])

  const columns: Column<Evaluation>[] = useMemo(
    () => [
      {
        id: 'enabled',
        accessor: 'id',
        width: '5%',
        disableSortBy: true,
        // eslint-disable-next-line react/display-name
        Cell: ({ row }) => {
          return (
            <Radio
              className={css.radioSelector}
              name={'selector'}
              onChange={() => {
                props?.handleOnSelect(JSON.stringify(row?.original?.input) || '')
                // handleSelectChange(event.currentTarget.checked, row.original.identifier)
              }}
            />
          )
        }
      },
      {
        Header: 'Entity',
        accessor: row => row,
        width: '30%',
        Cell: RenderPipelineName
      },

      //   {
      //     Header: 'Execution',
      //     accessor: row => row,
      //     width: '30%',
      //     Cell: RenderPolicySets
      //   },
      {
        Header: 'Evaluated on',
        accessor: row => row,
        width: '30%',
        Cell: RenderEvaluatedon
      },
      {
        Header: 'Action',
        accessor: row => row,
        width: '20%',
        Cell: RenderAction
      },
      {
        Header: 'Status',
        accessor: row => row,
        width: '15%',
        Cell: RenderStatus
      }
    ],
    []
  )

  return (
    <>
      <Layout.Vertical>
        <Layout.Horizontal>
          <Formik
            enableReinitialize={true}
            formName="CreatePolicySet"
            initialValues={{
              type: '',
              action: '',
              event: ''
            }}
            onSubmit={() => {
              noop
            }}
            validate={(values: { type: string; action: string; event: string }) => {
              if (values?.type == 'pipeline' && values?.action && values?.event == 'evaluation') {
                setEvalTableVisibility(true)
              } else {
                setEvalTableVisibility(false)
              }
            }}
          >
            {() => {
              return (
                <FormikForm>
                  <Layout.Horizontal spacing="small">
                    <FormInput.Select
                      items={[{ label: 'Pipeline', value: 'pipeline' }]}
                      label={'Entity Type'}
                      name="type"
                      disabled={false}
                    />
                    <FormInput.Select
                      items={[
                        { label: 'On Run', value: 'onrun' },
                        { label: 'On Save', value: 'onsave' }
                      ]}
                      label={'Action'}
                      name="action"
                      disabled={false}
                    />
                    <FormInput.Select
                      items={[{ label: 'Pipeline Evaluation', value: 'evaluation' }]}
                      label={'Event Type'}
                      name="event"
                      disabled={false}
                    />
                  </Layout.Horizontal>
                </FormikForm>
              )
            }}
          </Formik>
        </Layout.Horizontal>
      </Layout.Vertical>
      <Layout.Vertical>
        {isEvaluationTableVisible && evaluationsList?.length && (
          <Layout.Horizontal>
            <Table<Evaluation>
              className={css.table}
              columns={columns}
              data={evaluationsList as Evaluation[]}
              pagination={{
                itemCount: evaluationsList?.length || 0,
                pageSize: 1000,
                pageCount: 0,
                pageIndex: 0,
                gotoPage: (pageNumber: number) => setPage(pageNumber)
              }}
            />
          </Layout.Horizontal>
        )}
        {!isEvaluationTableVisible && (
          <Layout.Horizontal flex style={{ justifyContent: 'center', alignItems: 'center', height: '350px' }}>
            {getString('common.policy.noSelectInput')}
          </Layout.Horizontal>
        )}
      </Layout.Vertical>
    </>
  )
}

export default SelectInputModal
