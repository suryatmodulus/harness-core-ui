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
  TextInput,
  Icon
} from '@wings-software/uikit'
import { sumBy } from 'lodash-es'
import { assoc } from 'lodash/fp'
import cx from 'classnames'
import { Dialog } from '@blueprintjs/core'
import type { Distribution, WeightedVariation, Clause, Feature, Serve, Variation } from 'services/cf'
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

  const [isEditRulesOn, setEditRulesOn] = useState(false)

  useEffect(() => {
    if (!editing && isEditRulesOn) setEditRulesOn(false)
  }, [editing])

  const [, hideTargetModal] = useModalHook(() => (
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

  return (
    <Layout.Vertical>
      <Container style={{ marginLeft: 'auto' }}>
        {!isEditRulesOn && <Button text={i18n.tabTargeting.editRules} icon="edit" onClick={onEditBtnHandler} />}
      </Container>
      <Layout.Vertical>
        <DefaultRulesView
          formikProps={formikProps}
          editing={isEditRulesOn}
          defaultOnVariation={targetData.defaultOnVariation}
          bucketBy={targetData.envProperties?.defaultServe.distribution?.bucketBy}
          weightedVariations={targetData.envProperties?.defaultServe.distribution?.variations}
          variations={targetData.variations}
        />
      </Layout.Vertical>
      <Layout.Vertical>
        {isEditRulesOn && <CustomRulesView formikProps={formikProps} target={targetData} />}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default TodoTargeting

interface DefaultRulesProps {
  editing: boolean
  bucketBy?: string
  defaultOnVariation: string
  variations: Variation[]
  weightedVariations?: WeightedVariation[]
  formikProps: any
}

const DefaultRulesView: React.FC<DefaultRulesProps> = ({
  editing,
  bucketBy,
  variations,
  weightedVariations,
  formikProps
}) => {
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

  useEffect(() => {
    setPercentageView(formikProps.values.onVariation === 'percentage')
  }, [formikProps.values.onVariation])

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
                name="onVariation"
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
              <Text className={cx(css.textUppercase, css.textBlack)}>{formikProps.values.onVariation}</Text>
            )}

            {percentageView && (
              <PercentageRollout
                editing={editing}
                bucketBy={bucketBy}
                variations={variations}
                weightedVariations={weightedVariations || []}
                onSetPercentageValues={(value: Distribution) => {
                  formikProps.setFieldValue('defaultServe', { distribution: value })
                }}
              />
            )}
          </Container>
        </Layout.Horizontal>

        <Layout.Horizontal style={{ alignItems: 'baseline' }}>
          <Text width="150px">{i18n.tabTargeting.flagOff}</Text>
          {editing ? (
            <FormInput.Select name="offVariation" items={variationItems} onChange={formikProps.handleChange} />
          ) : (
            <Text className={cx(css.textUppercase, css.textBlack)}>{formikProps.values.offVariation}</Text>
          )}
        </Layout.Horizontal>
      </Container>
    </>
  )
}

interface PercentageRolloutProps {
  editing: boolean
  bucketBy?: string
  variations: Variation[]
  weightedVariations: WeightedVariation[]
  onSetPercentageValues(value: Distribution): void
}

const PercentageRollout: React.FC<PercentageRolloutProps> = ({
  editing,
  bucketBy,
  weightedVariations,
  variations,
  onSetPercentageValues
}) => {
  const [bucketByValue, setBucketByValue] = useState<string>(bucketBy || 'identifier')
  const [percentageValues, setPercentageValues] = useState<PercentageValues[]>([])
  const [percentageError, setPercentageError] = useState(false)

  const variationsToPercentage = variations?.map((elem, i) => {
    const weightedVariation = weightedVariations.find(wvElem => wvElem.variation === elem.identifier)
    return {
      id: elem.identifier,
      value: weightedVariation?.weight || 100 / variations?.length,
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

  useEffect(() => {
    onSetPercentageValues({
      bucketBy: bucketByValue,
      variations: percentageValues.map(elem => ({
        variation: elem.id,
        weight: elem.value
      }))
    })
  }, [bucketByValue, percentageValues])

  return (
    <Container>
      <Layout.Horizontal margin={{ bottom: editing ? 'small' : 'medium' }} style={{ alignItems: 'baseline' }}>
        <Text margin={{ right: 'small' }}>Bucket by</Text>
        {editing ? (
          <TextInput
            defaultValue={bucketByValue}
            onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setBucketByValue(ev.target.value)}
          />
        ) : (
          <Text>{bucketByValue}</Text>
        )}
      </Layout.Horizontal>
      <div
        style={{
          borderRadius: '10px',
          border: '1px solid #ccc',
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
          percentageValues?.map((elem, i) => (
            <Layout.Horizontal key={`${elem.id}-${i}`} margin={{ bottom: 'small' }} style={{ alignItems: 'baseline' }}>
              <span
                className={css.circle}
                style={{ backgroundColor: percentageValues[i].color, marginRight: '10px' }}
              ></span>
              <Text margin={{ right: 'medium' }} width="100px" className={css.textUppercase}>
                {elem.id}
              </Text>
              {editing ? (
                <input
                  type="number"
                  onChange={e => changeColorWidthSlider(e, elem.id)}
                  style={{ width: '50px', marginRight: '10px' }}
                  value={elem.value}
                  min={0}
                  max={100}
                />
              ) : (
                <Text>{elem.value}</Text>
              )}

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
  serve: Serve
  clauses: Clause[]
  priority: number
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

const emptyClause = (): Clause => ({
  id: '',
  op: operators[0].value,
  attribute: '',
  value: [],
  negate: false
})

interface ClauseRowProps {
  label: string
  attribute: string
  operator: SelectOption
  values: string[]
  isLast: boolean
  isSingleClause: boolean
  onOperatorChange: (op: string) => void
  onAttributeChange: (attr: string) => void
  onValuesChange: (values: string[]) => void
  onAddNewRow: () => void
  onRemoveRow: () => void
}

const ClauseRow: React.FC<ClauseRowProps> = props => {
  const {
    label,
    attribute,
    operator,
    values,
    isLast,
    isSingleClause,
    onAttributeChange,
    onOperatorChange,
    onValuesChange,
    onAddNewRow,
    onRemoveRow
  } = props

  const valueOpts = values.map((x: string) => ({ label: x, value: x }))
  const handleAttrChange = (e: React.ChangeEvent<HTMLInputElement>) => onAttributeChange(e.target.value)
  const handleOperatorChange = (data: SelectOption) => onOperatorChange(data.value as string)
  const handleValuesChange = (data: MultiSelectOption[]) => onValuesChange(data.map(x => x.value as string))

  const actions = [
    <Icon
      key="delete-icon-0"
      name="delete"
      style={{ visibility: isSingleClause ? 'hidden' : 'visible' }}
      size={24}
      color={Color.ORANGE_500}
      onClick={onRemoveRow}
    />,
    <Icon
      key="add-icon-1"
      name="add"
      style={{ visibility: isSingleClause || isLast ? 'visible' : 'hidden' }}
      size={24}
      color={Color.BLUE_500}
      onClick={onAddNewRow}
    />
  ]
  if (isSingleClause) {
    actions.reverse()
  }

  const height = '36px'

  return (
    <Layout.Horizontal spacing="xsmall">
      <Text
        color={Color.GREY_350}
        font="normal"
        style={{ display: 'flex', height, alignItems: 'center', justifyContent: 'flex-end', minWidth: '80px' }}
      >
        {label}
      </Text>
      <div style={{ flex: '1' }}>
        <TextInput style={{ height }} id="attribute" value={attribute} onChange={handleAttrChange} />
      </div>
      <div style={{ flex: '0.8' }}>
        <Select inputProps={{ style: { height } }} value={operator} items={operators} onChange={handleOperatorChange} />
      </div>
      <div style={{ flex: '1.5' }}>
        <MultiSelect
          fill
          className={css.valueMultiselect}
          tagInputProps={{ className: css.valueMultiselect, inputProps: { className: css.valueMultiselect } }}
          items={valueOpts}
          value={valueOpts}
          onChange={handleValuesChange}
        />
      </div>
      <Layout.Horizontal flex={{ align: 'center-center' }} spacing="small">
        {actions}
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

interface RuleCardProps {
  rule: RuleData
  variations: Variation[]
  onDelete: () => void
  onChange: (rule: RuleData) => void
}

const RuleCard: React.FC<RuleCardProps> = ({ rule, variations, onDelete, onChange }) => {
  const percentageRollout = { label: 'a rollout percentage', value: 'percentage' }
  const variationOps = variations
    .map((v: Variation) => ({ label: v.identifier, value: v.identifier }))
    .concat([percentageRollout])
  const currentServe = rule.serve.distribution
    ? percentageRollout
    : variationOps.find((v: SelectOption) => v.value === rule.serve.variation)
  const handleClauseChange = (idx: number, field: string) => (value: any) => {
    onChange({
      ...rule,
      clauses: assoc(idx, assoc(field, value, rule.clauses[idx]), rule.clauses)
    })
  }

  const handleServeChange = (data: SelectOption) => {
    if (data.value === 'percentage') {
      onChange({
        ...rule,
        serve: {
          distribution: {
            bucketBy: '',
            variations: []
          }
        }
      })
    } else {
      onChange({
        ...rule,
        serve: { variation: data.value as string }
      })
    }
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

  const handleRolloutChange = (data: any) => {
    onChange({
      ...rule,
      serve: { distribution: data }
    })
  }

  return (
    <Layout.Vertical margin="medium">
      <Layout.Horizontal spacing="small">
        <Card style={{ width: '100%' }}>
          <Layout.Vertical spacing="medium">
            {rule.clauses.map((clause, idx) => (
              <ClauseRow
                key={idx}
                isLast={idx === rule.clauses.length - 1}
                isSingleClause={rule.clauses.length === 1}
                label={idx === 0 ? i18n.tabTargeting.onRequest : i18n.and.toLocaleLowerCase()}
                attribute={clause?.attribute || ''}
                operator={operators.find(x => x.value === clause.op) || operators[0]}
                values={clause.value}
                onOperatorChange={handleClauseChange(idx, 'op')}
                onAttributeChange={handleClauseChange(idx, 'attribute')}
                onValuesChange={handleClauseChange(idx, 'value')}
                onAddNewRow={handleAddNewRow}
                onRemoveRow={handleRemove(idx)}
              />
            ))}
            <Layout.Horizontal spacing="xsmall">
              <Text
                color={Color.GREY_350}
                font="normal"
                style={{
                  display: 'flex',
                  height: '36px',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  minWidth: '80px'
                }}
              >
                {i18n.tabTargeting.serve.toLocaleLowerCase()}
              </Text>
              <div style={{ flexGrow: 0 }}>
                <Select
                  value={currentServe}
                  items={variationOps}
                  inputProps={{ style: { height: '36px' } }}
                  onChange={handleServeChange}
                />
              </div>
            </Layout.Horizontal>
            {currentServe?.value === 'percentage' && (
              <div style={{ paddingLeft: '94px' }}>
                <PercentageRollout
                  editing={true}
                  variations={variations}
                  weightedVariations={rule.serve.distribution?.variations || []}
                  onSetPercentageValues={handleRolloutChange}
                />
              </div>
            )}
          </Layout.Vertical>
        </Card>
        <Icon name="trash" margin={{ top: 'xlarge' }} size={24} color={Color.GREY_300} onClick={onDelete} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

interface CustomRulesViewProps {
  formikProps: any
  target: Feature
}

const CustomRulesView: React.FC<CustomRulesViewProps> = ({ formikProps, target }) => {
  const emptyRule = (priority = -1): RuleData => ({
    serve: { variation: '' },
    clauses: [emptyClause()],
    priority
  })

  const initialRules =
    target?.envProperties?.rules
      ?.map(sr => {
        return {
          ruleId: sr.ruleId,
          serve: sr.serve,
          clauses: sr.clauses,
          priority: sr.priority
        } as RuleData
      })
      .sort((a, b) => a.priority - b.priority) || []
  const [tempRules, setTempRules] = useState<RuleData[]>(initialRules)

  const getPriority = () => tempRules.reduce((max, next) => (max < next.priority ? next.priority : max), 0) + 100

  const handleOnRequest = () => {
    setTempRules([...tempRules, emptyRule(getPriority())])
  }

  const handleRuleChange = (index: number) => (newData: RuleData) => {
    setTempRules([...tempRules.slice(0, index), newData, ...tempRules.slice(index + 1)])
  }

  const handleDeleteRule = (index: number) => () => {
    setTempRules([...tempRules.slice(0, index), ...tempRules.slice(index + 1)])
  }

  useEffect(() => {
    formikProps.setFieldValue('customRules', tempRules)
  }, [tempRules])

  return (
    <>
      <Text
        font={{ weight: 'bold' }}
        color={Color.BLACK}
        margin={{ bottom: 'medium' }}
        className={css.defaultRulesHeadingMt}
      >
        {i18n.customRules.header}
      </Text>
      <Text margin={{ bottom: 'medium' }} color={Color.AQUA_500}>
        + {i18n.customRules.serveVartiation}
      </Text>
      {tempRules.length > 0 &&
        tempRules.map((rule, idx) => (
          <RuleCard
            key={idx}
            rule={rule}
            variations={target.variations}
            onDelete={handleDeleteRule(idx)}
            onChange={handleRuleChange(idx)}
          />
        ))}
      <Text color={Color.AQUA_500} onClick={handleOnRequest}>
        + {i18n.customRules.onRequest}
      </Text>
    </>
  )
}
