describe('My First Test', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', err => {
      // expect(err.message).to.include('Ignoring error for now')
      return false
    })

    cy.visit('#/login')
    cy.login('test', 'test')
  })
  it('Visits the Kitchen Sink', () => {
    cy.visitCreatePipeline()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()

    const addStageIcon = cy.get('[icon="plus"]')
    addStageIcon.click()

    const deployStage = cy.get('[data-testid="stage-Deployment"]')
    deployStage.click()

    cy.fillName('testStage_Cypress')
    cy.clickSubmit()

    cy.contains('span', '+ New Service').click()

    cy.fillName('testService')
    const serviceSave = cy.get('[data-id="service-save"]')
    serviceSave.click()

    const serviceSuccessToaster = cy.contains('span', 'Service created successfully')
    expect(serviceSuccessToaster)

    const newlyAddedService = cy.get('[value="testService"]')
    expect(newlyAddedService)

    cy.contains('span', '+ Add Variable').click()
    cy.fillName('testVariable')
    cy.get('[data-test-id="addVariableSave"]').click()

    const variableValue = cy.get('[name="variables[0].value"]')
    variableValue.type('varvalue')

    cy.contains('span', 'Next').click()

    cy.contains('span', 'New Environment').click()
    cy.fillName('testEnv')
    cy.contains('p', 'Production').click()
    cy.get('[data-id="environment-save"]').click()

    const envSuccessToaster = cy.contains('span', 'Environment created successfully')
    expect(envSuccessToaster)

    const newlyAddedEnv = cy.get('[value="testEnv"]')
    expect(newlyAddedEnv)

    cy.contains('p', 'Google Kubernetes Engine').click()

    // Submit with an incomplete form
    cy.contains('span', 'Next').click()

    expect(cy.contains('span', 'Connector is a required field'))
    expect(cy.contains('span', 'Namespace is a required field'))
    expect(cy.contains('span', 'Cluster is a required field'))
    expect(cy.contains('p', 'Error(s): 3'))

    const yamlButton = cy.get('[data-name="yaml-btn"]')
    yamlButton.click()

    // try to save the pipleine, the mock data has error
    cy.contains('span', 'Save').click({ force: true })

    const pipelineSaveErrorToaster = cy.contains(
      'span',
      'Invalid yaml: $.pipeline.stages[0].stage.spec.execution: is missing but it is required'
    )
    expect(pipelineSaveErrorToaster)
  })
})
