import '@testing-library/cypress/add-commands'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject> {
      login(username: string, pass: string): void
      visitCreatePipeline(): void
      fillName(name: string): void
      clickSubmit(): void
      fillField(fieldName: string, value: string): void
    }
  }
}

Cypress.Commands.add('login', (emailValue, password) => {
  const email = cy.get('[data-id="email-0"] input')
  email.clear()
  email.type(emailValue)

  const pass = cy.get('[data-id="password-1"] input')
  pass.clear()
  pass.type(password)

  cy.get('[type="submit"]').click()
})

Cypress.Commands.add('visitCreatePipeline', () => {
  cy.visit('#/account/accountId/cd/orgs/default/projects/project1/pipelines/-1/pipeline-studio/')
})

Cypress.Commands.add('fillName', value => {
  cy.get('[name="name"]').type(value)
})

Cypress.Commands.add('clickSubmit', () => {
  cy.get('[type="submit"]').click()
})

Cypress.Commands.add('fillField', (fieldName, value) => {
  cy.get(`[name=${fieldName}]`).type(value)
})
