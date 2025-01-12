import { NextFunction, Request, Response } from 'express'
import { UserService } from '../services/UserService'
import { Roles } from '../constants'
import { Logger } from 'winston'
import createHttpError from 'http-errors'

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    async create(req: Request, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password } = req.body
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.MANAGER,
            })
            res.status(201).json({ id: user.id })
        } catch (err) {
            next(err)
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        const { firstName, lastName, role } = req.body

        const userId = req.params.id

        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url param.'))
        }

        this.logger.debug('Request for updating a user', req.body)

        try {
            await this.userService.update(Number(userId), {
                firstName,
                lastName,
                role,
            })

            this.logger.info('User had been updated', { id: userId })

            res.json({ id: Number(userId) })
        } catch (err) {
            next(err)
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.getAll()

            this.logger.info('All users have been fetched')
            res.json(users)
        } catch (err) {
            next(err)
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id

        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url param.'))
            return
        }

        try {
            const user = await this.userService.findById(Number(userId))

            if (!user) {
                next(createHttpError(400, 'User id does not exists.'))
                return
            }

            this.logger.info('User has been fetched', { id: user.id })
            res.json(user)
        } catch (err) {
            next(err)
        }
    }
}
