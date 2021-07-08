import React from 'react'
import { Container, FormInput, Icon } from '@wings-software/uicore'
import type { CellProps } from 'react-table'
import { isEmpty } from 'lodash-es'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/strings'
import type { HealthSource } from 'services/cv'
import { HealthSourcesType } from '@cv/constants'
import Card from '@cv/components/Card/Card'
import type { HealthSourcesProps } from './HealthSources.types'
import css from './HealthSources.module.scss'

export default function HealthSources(props: HealthSourcesProps): React.ReactElement {
  const { getString } = useStrings()
  const { healthSources, isRunTimeInput } = props

  const TypeTableCell = (tableProps: CellProps<HealthSource>): JSX.Element => {
    const type = tableProps?.row?.values?.type
    const name = tableProps?.row?.values?.name
    return (
      <Container>
        {type === HealthSourcesType.AppDynamics ? (
          <div className={css.healthsourcename}>
            <div className={css.healthsourcetype}>
              <Icon name="service-appdynamics" size={18} />
            </div>
            {name}
          </div>
        ) : null}
        {type === HealthSourcesType.Stackdriver ? (
          <div className={css.healthsourcename}>
            <div className={css.healthsourcetype}>
              <Icon name="service-stackdriver" size={18} />
            </div>
            {name}
          </div>
        ) : null}
        {type === HealthSourcesType.StackdriverLog ? (
          <div className={css.healthsourcename}>
            <div className={css.healthsourcetype}>
              <Icon name="service-stackdriver" size={18} />
            </div>
            {name}
          </div>
        ) : null}
        {type === HealthSourcesType.Prometheus ? (
          <div className={css.healthsourcename}>
            <div className={css.healthsourcetype}>
              <Icon name="service-prometheus" size={18} />
            </div>
            {name}
          </div>
        ) : null}
        {type === HealthSourcesType.NewRelic ? (
          <div className={css.healthsourcename}>
            <div className={css.healthsourcetype}>
              <Icon name="service-newrelic" size={18} />
            </div>
            {name}
          </div>
        ) : null}
      </Container>
    )
  }

  const EditTableCell = (tableProps: CellProps<HealthSource>): JSX.Element => {
    return (
      <Container className={css.header}>
        <>{tableProps.value}</>
        <Icon
          name="edit"
          size={18}
          onClick={() => {
            //TODO will be implemented when common Health source component is ready
            //console.log(tableProps.row)}
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
          {!isRunTimeInput ? <a>{getString('plusAdd')}</a> : null}
        </div>
        {isEmpty(healthSources) ? (
          <>
            <FormInput.CustomRender
              name={'spec.healthSources'}
              render={() => <>{getString('connectors.cdng.healthSources.noHealthSourcesDefined')}</>}
            />
          </>
        ) : (
          <Table<HealthSource>
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
