describe('RUN PIPELINE MODAL', () => {
  const gitSyncCall =
    '/ng/api/git-sync/git-sync-enabled?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
  const pipelineSave =
    '/pipeline/api/pipelines?accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default'
  const inputSetsTemplateCall =
    '/pipeline/api/inputSets/template?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&pipelineIdentifier=testPipeline_Cypress&projectIdentifier=project1'
  const pipelineDetailsCall =
    '/pipeline/api/pipelines/testPipeline_Cypress?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
  const inputSetsGetCall =
    '/pipeline/api/inputSets?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&pipelineIdentifier=testPipeline_Cypress'
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.intercept('GET', gitSyncCall, { connectivityMode: null, gitSyncEnabled: false })
    cy.login('test', 'test')

    cy.visitCreatePipeline()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()

    cy.get('[icon="plus"]').click()
    cy.findByTestId('stage-Deployment').click()

    cy.fillName('testStage_Cypress')
    cy.clickSubmit()
  })

  it('should display the field errors if run pipeline form is invalid', () => {
    cy.intercept('POST', pipelineSave, { fixture: 'pipeline/api/pipelines.postsuccess' })
    cy.intercept('GET', inputSetsTemplateCall, { fixture: 'pipeline/api/runpipeline/inputsettemplate' })
    cy.intercept('GET', pipelineDetailsCall, { fixture: 'pipeline/api/runpipeline/getpipeline' })
    cy.intercept('GET', inputSetsGetCall, { fixture: 'pipeline/api/runpipeline/getinputsets' })

    cy.contains('span', 'Save').click({ force: true })
    cy.contains('span', 'Pipeline published successfully').should('be.visible')

    cy.findByTestId('card-run-pipeline').click()
    cy.contains('span', 'Run Pipeline').click()

    cy.contains('span', 'ConnectorRef is a required field')
      .should('be.visible')
      .should('have.class', 'FormError--error')
    cy.contains('span', 'Image Path is a required field').should('be.visible').should('have.class', 'FormError--error')
    cy.contains('span', 'Tag is a required field').should('be.visible').should('have.class', 'FormError--error')
  })
})
