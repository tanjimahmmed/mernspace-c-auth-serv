import { DataSource } from 'typeorm'
import request from 'supertest'
import createJWKSMock from 'mock-jwks'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import { Roles } from '../../src/constants'
import { User } from '../../src/entity/User'

describe('POST /users', () => {
    let connection: DataSource
    let jwks: ReturnType<typeof createJWKSMock>

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501')
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        jwks.start()
        await connection.dropDatabase()
        await connection.synchronize()
    })

    afterEach(() => {
        jwks.stop()
    })

    afterAll(async () => {
        await connection.destroy()
    })

    describe('Given all fields', () => {
        it('should persist the user in the database', async () => {
            // Generate token
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })
            // Register user
            const userData = {
                firstName: 'Tanjim',
                lastName: 'Emmett',
                email: 'tanjim@gmail.com',
                password: 'secret123',
                tenantId: 1,
            }

            // add to token cookie
            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData)

            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            expect(users).toHaveLength(1)

            expect(users[0].email).toBe(userData.email)
        })

        it('should create a manager user', async () => {
            // Generate token
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })
            // Register user
            const userData = {
                firstName: 'Tanjim',
                lastName: 'Emmett',
                email: 'tanjim@gmail.com',
                password: 'secret123',
                tenantId: 1,
            }

            // add to token cookie
            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData)

            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            expect(users).toHaveLength(1)

            expect(users[0].role).toBe(Roles.MANAGER)
        })

        it.todo('should return 403 if non admin user tries to create a user')
    })
})
