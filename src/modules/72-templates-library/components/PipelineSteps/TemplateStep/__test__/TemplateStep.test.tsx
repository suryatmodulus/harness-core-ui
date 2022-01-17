/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import {
  TemplateRegex,
  TemplateStep,
  VersionLabelRegex
} from '@templates-library/components/PipelineSteps/TemplateStep/TemplateStep'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getTemplateListPromise } from 'services/template-ng'
import type { TemplateInputSetStepProps } from '@templates-library/components/PipelineSteps/TemplateStep/TemplateInputSetStep'
import type { JsonNode, TemplateStepNode } from 'services/pipeline-ng'

const getDefaultStepValues = (): TemplateStepNode => {
  return {
    name: 's1',
    identifier: 's1',
    template: {
      templateRef: 'Some_really_really_really_long_name',
      versionLabel: 'Version1',
      templateInputs: {
        type: StepType.HTTP,
        spec: {
          url: '<+input>',
          requestBody: '<+input>'
        }
      } as JsonNode
    }
  }
}

jest.mock('services/template-ng', () => ({
  ...(jest.requireActual('services/template-ng') as any),
  useGetTemplateInputSetYaml: jest.fn().mockImplementation(() => ({
    data: {
      status: 'SUCCESS',
      data: 'type: "Http"\nspec:\n  url: "<+input>"\n  requestBody: "<+input>"\n',
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })),
  getTemplateListPromise: jest.fn().mockReturnValue(Promise.resolve({ status: 'SUCCESS', data: {} }))
}))

jest.mock('@templates-library/components/PipelineSteps/TemplateStep/TemplateStepWidget/TemplateStepWidget', () => ({
  ...(jest.requireActual(
    '@templates-library/components/PipelineSteps/TemplateStep/TemplateStepWidget/TemplateStepWidget'
  ) as any),
  // eslint-disable-next-line react/display-name
  TemplateStepWidgetWithRef: (_props: any) => {
    return <div className="template-step-widget-ref" />
  }
}))

jest.mock('@templates-library/components/PipelineSteps/TemplateStep/TemplateInputSetStep', () => {
  return function TemplateInputSetStep(_props: TemplateInputSetStepProps) {
    return <div className="template-input-set-step" />
  }
})

describe('<TemplateStep /> tests', () => {
  beforeEach(() => {
    factory.registerStep(new TemplateStep())
  })
  test('snapshot test for edit view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getDefaultStepValues()}
        type={StepType.Template}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container.getElementsByClassName('template-step-widget-ref').length).toBe(1)
  })
  test('snapshot test for input set view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getDefaultStepValues()}
        type={StepType.Template}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container.getElementsByClassName('template-input-set-step').length).toBe(1)
  })
  test('invocation map should call template list', () => {
    const invocationMap = factory.getStep(StepType.Template)?.getInvocationMap?.()
    invocationMap?.get(TemplateRegex)?.('', '', {})
    expect(getTemplateListPromise).toBeCalled()
    invocationMap?.get(VersionLabelRegex)?.('', '', {})
    expect(getTemplateListPromise).toBeCalled()
  })
})
