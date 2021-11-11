import React from 'react'
import { Container, FormInput, Icon, TableV2 } from '@wings-software/uicore'
import type { CellProps } from 'react-table'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { HealthSource } from 'services/cv'
import Card from '@cv/components/Card/Card'
import { getIconBySourceType } from '@cv/pages/health-source/HealthSourceTable/HealthSourceTable.utils'
import type { HealthSourcesProps } from './HealthSources.types'
import css from './HealthSources.module.scss'

export default function HealthSources(props: HealthSourcesProps): React.ReactElement {
  const { getString } = useStrings()
  const { healthSources, isRunTimeInput, addHealthSource, editHealthSource } = props

  const TypeTableCell = (tableProps: CellProps<HealthSource>): JSX.Element => {
    const type = tableProps?.row?.values?.type
    const name = tableProps?.row?.values?.name
    return (
      <div className={css.healthsourcename}>
        <div className={css.healthsourcetype}>
          <Icon name={getIconBySourceType(type)} size={18} />
        </div>
        {name}
      </div>
    )
  }

  const EditTableCell = (tableProps: CellProps<HealthSource>): JSX.Element => {
    return (
      <Container className={css.header}>
        <>{tableProps.value}</>
        <Icon
          name="edit"
          size={14}
          onClick={() => {
            editHealthSource(tableProps?.row?.original)
          }}
          className={css.link}
        />
      </Container>
    )
  }

  return (
    <Card>
      <>
        <div className={css.header}>
          <p>{getString('connectors.cdng.healthSources.label')}</p>
          {!isRunTimeInput ? <a onClick={addHealthSource}>{getString('plusAdd')}</a> : null}
        </div>
        {isEmpty(healthSources) ? (
          <>
            <FormInput.CustomRender
              name={'spec.healthSources'}
              render={() => <>{getString('connectors.cdng.healthSources.noHealthSourcesDefined')}</>}
            />
          </>
        ) : (
          <TableV2<HealthSource>
            columns={[
              {
                Header: 'Source',
                accessor: 'name',
                width: '60%',
                Cell: TypeTableCell
              },
              {
                Header: 'Type',
                accessor: 'type',
                width: '40%',
                Cell: EditTableCell
              }
            ]}
            data={healthSources as HealthSource[]}
            className={css.table}
          />
        )}
      </>
    </Card>
  )
}
