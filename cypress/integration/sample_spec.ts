describe('My First Test', () => {
  it('Visits the Kitchen Sink', () => {
    cy.visit('#/login')
    const email = cy.get('[data-id="email-0"] input')
    email.clear()
    email.type('test')

    const pass = cy.get('[data-id="password-1"] input')
    pass.clear()
    pass.type('test')

    cy.get('[type="submit"]').click()

    // cy.intercept('https://localhost:8181/api/users/login')
  })
})
