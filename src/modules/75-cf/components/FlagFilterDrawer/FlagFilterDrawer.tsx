import React, { useState } from 'react'
import {
  Formik,
  FormikForm as Form,
  FormInput,
  Layout,
  Button,
  FlexExpander,
  Radio,
  RadioGroup,
  Text,
  Color,
  DateInput
} from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import css from './FlagFilterDrawer.module.scss'

// TODO: Check these ...SelectOptions fields
const envSelectOptions = [
  { label: 'Production', value: 'production' },
  { label: 'Development', value: 'development' }
]

const termSelectOptions = [
  { label: 'Temporary', value: 'temporary' },
  { label: 'Permanent', value: 'Permanent' }
]

const switchSelectOptions = [
  { label: 'On', value: 'on' },
  { label: 'Off', value: 'off' }
]

const statusSelectOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Live', value: 'live' },
  { label: 'Never Requested', value: 'neverRequested' },
  { label: 'Archived', value: 'archived' }
]

interface FlagFilterDrawerProps {
  isSaveFiltersOn: boolean
  setIsSaveFiltersOn: (param: boolean) => void
}

const FlagFilterDrawer: React.FC<FlagFilterDrawerProps> = props => {
  const { getString } = useStrings()
  const { isSaveFiltersOn, setIsSaveFiltersOn } = props
  const [isBtnsFilterDisabled, setIsBtnsFilterDisabled] = useState(true)

  const onChangeOwner = (itemsArray: unknown[]): void => {
    itemsArray.length > 0 ? setIsBtnsFilterDisabled(false) : setIsBtnsFilterDisabled(true)
  }

  const onBtnSaveFilter = (saveOrApplyFilter: boolean): void => {
    setIsSaveFiltersOn(saveOrApplyFilter)
  }

  const fncNewFilter = (): JSX.Element => {
    return (
      <Formik
        initialValues={{}}
        onSubmit={vals => {
          alert(JSON.stringify(vals, null, 2))
        }}
      >
        {() => (
          <Form>
            <Layout.Vertical padding="large" height="100%">
              <FormInput.Select
                name="env"
                items={envSelectOptions}
                label={getString('cf.featureFlags.flagFilters.environment')}
                placeholder={getString('cf.featureFlags.flagFilters.envDefault')}
              />

              <Layout.Horizontal flex>
                <FormInput.Select
                  name="term"
                  items={termSelectOptions}
                  label={getString('cf.featureFlags.flagFilters.term')}
                  placeholder={getString('cf.featureFlags.flagFilters.any')}
                />

                <FormInput.Select
                  name="switch"
                  items={switchSelectOptions}
                  label={getString('cf.featureFlags.flagFilters.switchOnOff')}
                  placeholder={getString('cf.featureFlags.flagFilters.any')}
                />

                <FormInput.Select
                  name="status"
                  items={statusSelectOptions}
                  label={getString('cf.featureFlags.flagFilters.status')}
                  placeholder={getString('cf.featureFlags.flagFilters.any')}
                />
              </Layout.Horizontal>

              {/* TODO: Check the UIKit for some alternative, it doesn't render nicely inside Drawer */}
              <Layout.Horizontal margin={{ top: 'medium', bottom: 'medium' }}>
                <DateInput placeholder={getString('cf.featureFlags.flagFilters.any')} />
                <FlexExpander />
                <DateInput placeholder={getString('cf.featureFlags.flagFilters.any')} />
              </Layout.Horizontal>

              <FormInput.TagInput
                name="owner"
                label={getString('cf.featureFlags.flagFilters.owner')}
                items={['placeholder1', 'placeholder2']}
                labelFor={nameIcon => nameIcon as string}
                itemFromNewTag={newTag => newTag}
                tagInputProps={{
                  allowNewTag: true,
                  placeholder: getString('cf.featureFlags.flagFilters.ownerOrPinPlaceholder')
                }}
                onChange={items => onChangeOwner(items)}
              />

              <FormInput.Text
                name="creator"
                placeholder={getString('name')}
                label={getString('cf.featureFlags.flagFilters.creator')}
              />

              <FormInput.TagInput
                name="tags"
                label={getString('common.tagsLabel')}
                items={['placeholder1', 'placeholder2']}
                labelFor={nameIcon => nameIcon as string}
                itemFromNewTag={newTag => newTag}
                tagInputProps={{
                  allowNewTag: true,
                  placeholder: getString('cf.featureFlags.flagFilters.tagsPlaceholder')
                }}
              />

              <FormInput.Text
                name="pinnedBy"
                placeholder={getString('cf.featureFlags.flagFilters.ownerOrPinPlaceholder')}
                label={getString('cf.featureFlags.flagFilters.flagsBy')}
              />

              <FormInput.Text
                name="target"
                placeholder={getString('cf.featureFlags.flagFilters.individualTargets')}
                label={getString('cf.featureFlags.flagFilters.target')}
              />

              <FlexExpander />

              <Layout.Horizontal className={css.flagFilterBtns}>
                <Button
                  type="submit"
                  intent="primary"
                  text={getString('cf.featureFlags.flagFilters.apply').toUpperCase()}
                  margin={{ right: 'medium' }}
                  disabled={isBtnsFilterDisabled}
                />
                <Button
                  minimal
                  text={getString('cf.featureFlags.flagFilters.saveFilters')}
                  disabled={isBtnsFilterDisabled}
                  onClick={() => onBtnSaveFilter(true)}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Form>
        )}
      </Formik>
    )
  }

  const fncSaveFilter = (): JSX.Element => {
    return (
      <Formik initialValues={{}} onSubmit={vals => alert(JSON.stringify(vals, null, 2))}>
        {() => (
          <Form>
            <Layout.Vertical height="100%" padding="large" className={css.saveFilterContainer}>
              <RadioGroup name="radioGroupOne">
                <Layout.Horizontal>
                  <Radio
                    name="radioProp"
                    label={getString('cf.featureFlags.flagFilters.overwriteRadio')}
                    font={{ weight: 'bold' }}
                    width="35%"
                  />
                  <FormInput.Text name="overwriteExisting" style={{ width: '45%' }} />
                </Layout.Horizontal>

                <Layout.Horizontal>
                  <Radio
                    name="radioProp"
                    label={getString('cf.featureFlags.flagFilters.createFilter')}
                    font={{ weight: 'bold' }}
                    width="35%"
                  />
                  <FormInput.Text name="createNew" style={{ width: '45%' }} />
                </Layout.Horizontal>
              </RadioGroup>

              <FormInput.CheckBox
                name="defaultFilter"
                disabled
                defaultChecked
                label={getString('cf.featureFlags.flagFilters.defaultFilter')}
              />
              <Text>{getString('cf.featureFlags.flagFilters.defaultFilterText')}</Text>

              <RadioGroup name="radioGroupTwo">
                <Text color={Color.BLACK}>{getString('cf.featureFlags.flagFilters.filterVisible')}</Text>
                <Layout.Vertical>
                  <Radio name="radioPropVisible" label={getString('cf.featureFlags.flagFilters.onlyMe')} />
                  <Radio name="radioPropVisible" label={getString('cf.featureFlags.flagFilters.everyone')} />
                </Layout.Vertical>
              </RadioGroup>

              <Layout.Horizontal flex className={css.flagFilterBtns}>
                <Button
                  type="submit"
                  intent="primary"
                  text={getString('cf.featureFlags.flagFilters.save').toUpperCase()}
                  margin={{ right: 'medium' }}
                />
                <Button
                  minimal
                  text={getString('cf.featureFlags.flagFilters.cancel')}
                  disabled={isBtnsFilterDisabled}
                  onClick={() => onBtnSaveFilter(false)}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Form>
        )}
      </Formik>
    )
  }

  return <>{isSaveFiltersOn ? fncSaveFilter() : fncNewFilter()}</>
}

export default FlagFilterDrawer
