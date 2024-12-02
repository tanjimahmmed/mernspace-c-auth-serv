import { NextFunction, Response } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import { validationResult } from 'express-validator'
import { TokenService } from '../services/TokenService'

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        // validation
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() })
        }

        const { firstName, lastName, email, password } = req.body

        this.logger.debug('New request to register a user', {
            firstName,
            lastName,
            email,
            password: '******',
        })
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            })
            this.logger.info('User has been registered', { id: user.id })

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            }

            const accessToken = this.tokenService.generateAccessToken(payload)

            // persist the refresh token
            const newRfreshToken =
                await this.tokenService.persistRefreshToken(user)
            // const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365
            // const refreshTokenRepository =
            //     AppDataSource.getRepository(RefreshToken)
            // const newRfreshToken = await refreshTokenRepository.save({
            //     user: user,
            //     expiresAt: new Date(Date.now() + MS_IN_YEAR),
            // })

            // const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            //     algorithm: 'HS256',
            //     expiresIn: '1y',
            //     issuer: 'auth-service',
            //     jwtid: String(newRfreshToken.id)
            // })
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRfreshToken.id),
            })

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60,
                httpOnly: true,
            })

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true,
            })

            res.status(201).json({ id: user.id })
        } catch (err) {
            next(err)
            return
        }
    }
}
