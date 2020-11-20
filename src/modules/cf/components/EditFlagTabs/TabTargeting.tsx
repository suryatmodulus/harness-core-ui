import React, { useState, useEffect } from 'react'
import {
  Color,
  Layout,
  Button,
  Text,
  Container,
  Formik,
  FormikForm as Form,
  FormInput,
  useModalHook,
  SelectOption,
  Card,
  Select,
  MultiSelect,
  MultiSelectOption,
  TextInput
} from '@wings-software/uikit'
import { sumBy } from 'lodash-es'
import { assoc } from 'lodash/fp'
import cx from 'classnames'
import { Dialog } from '@blueprintjs/core'
import type { Feature, Variation } from 'services/cf'
import type { ClauseData } from '../../utils/instructions'
import i18n from './Tabs.i18n'
import css from './TabTargeting.module.scss'

const randomColor = ['cyan', 'blue', 'lime', 'yellow', 'green', 'black']

interface TabTargetingProps {
  formikProps: any
  editing: boolean
  refetch: any
  targetData: Feature
  isBooleanTypeFlag?: boolean
  projectIdentifier: string
  environmentIdentifier: string
  setEditing: Function
}

interface PercentageValues {
  id: string
  value: number
  color: string
}

const TodoTargeting: React.FC<TabTargetingProps> = props => {
  const { formikProps, targetData, editing, setEditing } = props

  const [, /*isEditOn*/ setIsEditOn] = useState<boolean>(editing)
  const [isEditRulesOn, setEditRulesOn] = useState(false)
  // const [isServeTargetOn, setIsServeTargetOn] = useState(false)

  useEffect(() => {
    setIsEditOn(editing)
    if (!editing && isEditRulesOn) setEditRulesOn(false)
  }, [editing])

  const [, /*onOpenTargetModal*/ hideTargetModal] = useModalHook(() => (
    <Dialog onClose={hideTargetModal} title="" isOpen={true}>
      <Layout.Vertical>
        <Text>
          {i18n.tabTargeting.serve} {i18n.tabTargeting.following}:
        </Text>

        <Formik initialValues={{}} onSubmit={() => alert('To be implemented...')}>
          {() => (
            <Form>
              <FormInput.TextArea name="targets" />
            </Form>
          )}
        </Formik>

        <Layout.Horizontal>
          <Button intent="primary" text={i18n.save} onClick={() => alert('To be implemented...')} />
          <Button minimal text={i18n.cancel} onClick={hideTargetModal} />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Dialog>
  ))

  const onEditBtnHandler = (): void => {
    setEditRulesOn(!isEditRulesOn)
    setEditing(true)
  }

  // const onServeTarget = (): void => {
  //   setIsServeTargetOn(true)
  // }

  return (
    <Layout.Vertical>
      <Container style={{ marginLeft: 'auto' }}>
        {!isEditRulesOn && <Button text={i18n.tabTargeting.editRules} icon="edit" onClick={onEditBtnHandler} />}
      </Container>
      <Layout.Vertical>
        <DefaultRulesView formikProps={formikProps} editing={isEditRulesOn} variations={targetData.variations} />
      </Layout.Vertical>
      <Layout.Vertical>
        <CustomRulesView editing={isEditRulesOn} target={targetData} />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default TodoTargeting

interface DefaultRulesProps {
  editing: boolean
  variations: Variation[]
  formikProps: any
}

const DefaultRulesView: React.FC<DefaultRulesProps> = ({ editing, variations, formikProps }) => {
  const [percentageView, setPercentageView] = useState<boolean>(false)

  const variationItems = variations.map<SelectOption>(elem => ({
    label: elem.name as string,
    value: elem.value as string
  }))

  const onDefaultONChange = (item: SelectOption) => {
    if (item.value === 'percentage') {
      setPercentageView(true)
    } else {
      setPercentageView(false)
    }
  }

  return (
    <>
      <Text
        font={{ weight: 'bold' }}
        color={Color.BLACK}
        margin={{ bottom: 'medium' }}
        className={cx(editing && css.defaultRulesHeadingMt)}
      >
        {i18n.defaultRules}
      </Text>
      <Container className={css.defaultRulesContainer}>
        <Layout.Horizontal margin={{ bottom: 'small' }} style={{ alignItems: 'baseline' }}>
          <Text width="150px">{i18n.tabTargeting.flagOn}</Text>
          <Container>
            {editing ? (
              <FormInput.Select
                name="defaultOnVariation"
                items={[
                  ...variationItems,
                  {
                    label: 'Percentage rollout',
                    value: 'percentage'
                  }
                ]}
                onChange={onDefaultONChange}
              />
            ) : (
              <Text className={cx(css.textUppercase, css.textBlack)}>{formikProps.values.defaultOnVariation}</Text>
            )}

            {percentageView && <PercentageRollout variations={variations} />}
          </Container>
        </Layout.Horizontal>

        <Layout.Horizontal style={{ alignItems: 'baseline' }}>
          <Text width="150px">{i18n.tabTargeting.flagOff}</Text>
          {editing ? (
            <FormInput.Select name="defaultOffVariation" items={variationItems} onChange={formikProps.handleChange} />
          ) : (
            <Text className={cx(css.textUppercase, css.textBlack)}>{formikProps.values.defaultOffVariation}</Text>
          )}
        </Layout.Horizontal>
      </Container>
    </>
  )
}

interface PercentageRolloutProps {
  variations: Variation[]
}

const PercentageRollout: React.FC<PercentageRolloutProps> = ({ variations }) => {
  const [percentageValues, setPercentageValues] = useState<PercentageValues[] | undefined>([])
  const [percentageError, setPercentageError] = useState(false)

  // variations length minimum is 2
  const variationsToPercentage = variations?.map((elem, i) => {
    return {
      id: elem.identifier,
      value: 100 / variations?.length,
      color: randomColor[i]
    }
  })

  const changeColorWidthSlider = (e: React.ChangeEvent<HTMLInputElement>, id: string): void => {
    const percentageThreshold = 100

    if (percentageValues) {
      const onUpdateValue = percentageValues.map(elem => {
        if (elem.id === id) {
          return { ...elem, value: +e.target.value }
        }
        return elem
      })

      const valueOfInputs = sumBy(onUpdateValue, 'value')

      if (valueOfInputs > percentageThreshold) {
        return setPercentageError(true)
      } else {
        setPercentageError(false)
      }

      setPercentageValues(onUpdateValue)
    }
  }

  useEffect(() => {
    setPercentageValues(variationsToPercentage)
  }, [])

  return (
    <Container>
      <div
        style={{
          borderRadius: 'var(--spacing-medium)',
          border: '1px solid var(--grey-300)',
          width: '300px',
          height: '15px',
          display: 'flex',
          overflow: 'hidden'
        }}
      >
        {percentageValues?.map(elem => (
          <span
            key={elem.id}
            style={{
              width: `${elem.value}%`,
              backgroundColor: elem.color,
              display: 'inline-block',
              height: '13px'
            }}
          />
        ))}
      </div>
      <Container margin={{ top: 'small' }}>
        {percentageValues?.length &&
          variations?.map((elem, i) => (
            <Layout.Horizontal
              key={`${elem.identifier}-${i}`}
              margin={{ bottom: 'small' }}
              style={{ alignItems: 'baseline' }}
            >
              <span
                className={css.circle}
                style={{ backgroundColor: percentageValues[i].color, marginRight: '10px' }}
              ></span>
              <Text margin={{ right: 'medium' }} width="100px" className={css.textUppercase}>
                {elem.identifier}
              </Text>
              <input
                type="number"
                onChange={e => changeColorWidthSlider(e, elem.identifier)}
                style={{ width: '50px', marginRight: 'var(--spacing-medium)' }}
                defaultValue={50}
                min={0}
                max={100}
              />
              <Text icon="percentage" iconProps={{ color: Color.GREY_300 }} />
            </Layout.Horizontal>
          ))}
        {percentageError && <Text intent="danger">Cannot set above 100%</Text>}
      </Container>
    </Container>
  )
}

interface RuleData {
  ruleId?: string
  serve: string
  clauses: ClauseData[]
}

interface ClauseRowProps {
  label: string
  attribute: string
  operator: SelectOption
  values: string[]
  hasDelete: boolean
  onOperatorChange: (op: string) => void
  onAttributeChange: (attr: string) => void
  onValuesChange: (values: string[]) => void
  onAddNewRow: () => void
  onRemoveRow: () => void
}

const operators = [
  { label: i18n.operators.startsWith, value: 'starts_with' },
  { label: i18n.operators.endsWith, value: 'ends_with' },
  { label: i18n.operators.match, value: 'match' },
  { label: i18n.operators.contains, value: 'contains' },
  { label: i18n.operators.equal, value: 'equal' },
  { label: i18n.operators.equalSensitive, value: 'equal_sensitive' },
  { label: i18n.operators.in, value: 'in' }
]

const findOperatorOption = (value: string) => operators.find(x => x.value === value) || operators[0]

const createOpt = (x: string) => ({ label: x, value: x })
const emptyClause = () => ({
  op: operators[0].value,
  attribute: '',
  values: []
})

const ClauseRow: React.FC<ClauseRowProps> = props => {
  const {
    label,
    attribute,
    operator,
    values,
    hasDelete,
    onAttributeChange,
    onOperatorChange,
    onValuesChange,
    onAddNewRow,
    onRemoveRow
  } = props
  const valueOpts = values.map(createOpt)
  const handleAttrChange = (e: React.ChangeEvent<HTMLInputElement>) => onAttributeChange(e.target.value)
  const handleOperatorChange = (data: SelectOption) => onOperatorChange(data.value as string)
  const handleValuesChange = (data: MultiSelectOption[]) => onValuesChange(data.map(x => x.value as string))

  return (
    <Layout.Horizontal>
      <Text>{label}</Text>
      <TextInput id="attribute" value={attribute} onChange={handleAttrChange} />
      <Select value={operator} items={operators} onChange={handleOperatorChange} />
      <MultiSelect value={valueOpts} items={valueOpts} onChange={handleValuesChange} />
      <Button intent="primary" icon="plus" round onClick={onAddNewRow} />
      {hasDelete && <Button intent="danger" icon="delete" round onClick={onRemoveRow} />}
    </Layout.Horizontal>
  )
}

interface RuleCardProps {
  rule: RuleData
  onChange: (rule: RuleData) => void
}

const RuleCard: React.FC<RuleCardProps> = ({ rule, onChange }) => {
  const handleClauseChange = (idx: number, field: string) => (value: any) => {
    onChange({
      ...rule,
      clauses: assoc(idx, assoc(field, value, rule.clauses[idx]), rule.clauses)
    })
  }

  const handleAddNewRow = () => {
    onChange({
      ...rule,
      clauses: [...rule.clauses, emptyClause()]
    })
  }

  const handleRemove = (idx: number) => () => {
    onChange({
      ...rule,
      clauses: rule.clauses.filter((_, index) => index !== idx)
    })
  }

  return (
    <Card>
      <Layout.Vertical>
        {rule.clauses.map((clause, idx) => (
          <ClauseRow
            key={idx}
            hasDelete={idx !== 0}
            label={idx === 0 ? 'Request on' : 'and'}
            attribute={clause.attribute}
            operator={findOperatorOption(clause.op)}
            values={clause.values}
            onOperatorChange={handleClauseChange(idx, 'op')}
            onAttributeChange={handleClauseChange(idx, 'attribute')}
            onValuesChange={handleClauseChange(idx, 'values')}
            onAddNewRow={handleAddNewRow}
            onRemoveRow={handleRemove(idx)}
          />
        ))}
      </Layout.Vertical>
    </Card>
  )
}

const CustomRulesView: React.FC<any> = ({ editing }) => {
  const [tempRules, setTempRules] = useState<RuleData[]>([])
  const emptyRule: () => RuleData = () => ({
    serve: '',
    clauses: [emptyClause()]
  })

  // eslint-disable-next-line
  const handleOnRequest = () => {
    setTempRules([...tempRules, emptyRule()])
  }

  const handleRuleChange = (index: number) => (newData: RuleData) => {
    setTempRules([...tempRules.slice(0, index), newData, ...tempRules.slice(index + 1)])
  }

  return (
    <>
      <Text
        font={{ weight: 'bold' }}
        color={Color.BLACK}
        margin={{ bottom: 'medium' }}
        className={cx(editing && css.defaultRulesHeadingMt)}
      >
        {i18n.customRules.header}
      </Text>
      <Text margin={{ bottom: 'medium' }} color={Color.AQUA_500}>
        + {i18n.customRules.serveVartiation}
      </Text>
      {tempRules.length > 0 &&
        tempRules.map((rule, idx) => <RuleCard key={idx} rule={rule} onChange={handleRuleChange(idx)} />)}
      {/* Intentional onClick returning reference to handler to pass typecheck*/}
      <Text color={Color.AQUA_500} onClick={() => handleOnRequest}>
        + {i18n.customRules.onRequest}
      </Text>
    </>
  )
}
