import request from 'supertest'
import app from '../../src/app'

describe('POST /auth/register', () => {
    describe('Given all fields', () => {
        it('should return 201', async () => {
            // Arrange
            const userData = {
                firstName: 'Tanjim',
                lastName: 'Emmett',
                email: 'tanjim@gmaail.com',
                password: 'secret',
            }
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            // Assert
            expect(response.statusCode).toBe(201)
        })
    })
    describe('Fields are missing', () => {})
})
