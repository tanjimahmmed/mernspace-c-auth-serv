import request from 'supertest'
import app from '../../src/app'
import { User } from '../../src/entity/User'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/constants'

describe('POST /auth/register', () => {
    let connection: DataSource

    beforeAll(async () => {
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        // Database truncate
        await connection.dropDatabase()
        await connection.synchronize()
    })

    afterAll(async () => {
        await connection.destroy()
    })

    describe('Given all fields', () => {
        it('should return 201', async () => {
            // Arrange
            const userData = {
                firstName: 'Tanjim',
                lastName: 'Emmett',
                email: 'tanjim@gmail.com',
                password: 'secret',
            }
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            // Assert
            expect(response.statusCode).toBe(201)
        })

        it('should return valid json response', async () => {
            // Arrange
            const userData = {
                firstName: 'Tanjim',
                lastName: 'Emmett',
                email: 'tanjim@gmail.com',
                password: 'secret',
            }
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            // Assert
            expect(
                (response.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'))
        })

        it('should persist the user in the database', async () => {
            // Arrange
            const userData = {
                firstName: 'Tanjim',
                lastName: 'Emmett',
                email: 'tanjim@gmail.com',
                password: 'secret',
            }
            // Act
            await request(app).post('/auth/register').send(userData)

            // Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users).toHaveLength(1)
            expect(users[0].firstName).toBe(userData.firstName)
            expect(users[0].lastName).toBe(userData.lastName)
            expect(users[0].email).toBe(userData.email)
        })

        it('should return an id of the created user', async () => {
            // Arrange
            const userData = {
                firstName: 'Tanjim',
                lastName: 'Emmett',
                email: 'tanjim@gmail.com',
                password: 'secret',
            }
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // Assert
            expect(response.body).toHaveProperty('id')
            const repository = connection.getRepository(User)
            const users = await repository.find()
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            )
        })

        it('should assign a customer role', async () => {
            // Arrange
            const userData = {
                firstName: 'Tanjim',
                lastName: 'Emmett',
                email: 'tanjim@gmail.com',
                password: 'secret',
            }
            // Act
            await request(app).post('/auth/register').send(userData)

            // Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users[0]).toHaveProperty('role')
            expect(users[0].role).toBe(Roles.CUSTOMER)
        })

        it('should store the hashed password in the database', async () => {
            // Arrange
            const userData = {
                firstName: 'Tanjim',
                lastName: 'Emmett',
                email: 'tanjim@gmail.com',
                password: 'secret',
            }
            // Act
            await request(app).post('/auth/register').send(userData)

            // Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users[0].password).not.toBe(userData.password)
            expect(users[0].password).toHaveLength(60)
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/)
        })

        it('should return 400 status code if email is already exists', async () => {
            // Arrange
            const userData = {
                firstName: 'Tanjim',
                lastName: 'Emmett',
                email: 'tanjim@gmail.com',
                password: 'secret',
            }
            const userRepository = connection.getRepository(User)
            await userRepository.save({ ...userData, role: Roles.CUSTOMER })
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            const users = await userRepository.find()
            // Assert
            expect(response.statusCode).toBe(400)
            expect(users).toHaveLength(1)
        })
    })
    describe('Fields are missing', () => {})
})
