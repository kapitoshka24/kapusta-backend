const { AuthService,
    UserService,
    EmailService,
    CreateSenderNodemailer,
} = require('../services')
const { UsersRepository } = require('../repositories')
const { HttpCode } = require('../helpers/constants')

require('dotenv').config()


const serviceUser = new UserService()
const serviceAuth = new AuthService()

const reg = async (req, res, next) => {
    const { name, email, password, subscription } = req.body
    const user = await serviceUser.findByEmail(email)
    if (user) {
        return next({
            status: HttpCode.CONFLICT,
            data: 'Conflict',
            message: 'This email is already use'
        })
    }
    try {
        const newUser = await serviceUser.create({ name, email, password, subscription })

        try {
            const emailService = new EmailService(process.env.NODE_ENV, new CreateSenderNodemailer())
            await emailService.sendVerifyEmail(newUser.verifyToken, newUser.email, newUser.name)

        } catch (e) {
            console.log(e.message)
        }


        return res.status(HttpCode.CREATED).json({
            status: 'success',
            code: HttpCode.CREATED,
            data: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            }
        })
    } catch (e) {
        next(e)
    }
}
const login = async (req, res, next) => {
    const { email, password } = req.body
    try {
        const token = await serviceAuth.login({ email, password })
        if (token) {
            return res.status(HttpCode.OK).json({
                status: 'success',
                code: HttpCode.OK,
                data: {
                    token
                }
            })
        }
        next({
            status: HttpCode.UNAUTHORIZED,
            message: 'Invalid credentials'
        })
    } catch (e) {
        next(e)
    }
}
const logout = async (req, res, next) => {
    try {
        const id = req.user.id
        await serviceAuth.logout(id)
        return res.status(HttpCode.NO_CONTENT).json({
            status: 'success',
            code: HttpCode.NO_CONTENT,
            data: 'unauthorized'
        })
    } catch (e) {
        next(e)
    }

}

const getCurrentUser = async (req, res, next) => {
    try {
        const id = req.user.id
        if (id) {

            const { name, email } = await serviceUser.findById(id)

            return res.status(HttpCode.OK).json({
                status: 'success',
                code: HttpCode.OK,
                data: {
                    name,
                    email
                }
            })
        }
        next({
            status: HttpCode.UNAUTHORIZED,
            message: 'Not authorized'
        })
    } catch (e) {
        next(e)
    }

}


const verify = async (req, res, next) => {
    try {

        const user = await new UsersRepository().findByVerifyToken(req.params.token)

        if (user) {
            await new UsersRepository().updateTokenVerify(user.id, true, null)

            return res.json({
                status: 'success',
                code: HttpCode.OK,
                data: {
                    message: 'Success!'
                }
            })
        }
        return res.status(HttpCode.BAD_REQUEST).json({
            status: 'error',
            code: HttpCode.BAD_REQUEST,
            message: 'Verification token is valid',

        })
    } catch (error) {
        next(error)
    }

}
const repeatEmailVerification = async (req, res, next) => {
    try {
        const user = await new UsersRepository().findByEmail(req.body.email)
        if (user) {
            const { name, email, isVerified, verifyToken } = user
            if (!isVerified) {
                const emailService = new EmailService(process.env.NODE_ENV, new CreateSenderNodemailer(
                ))
                await emailService.sendVerifyEmail(verifyToken, email, name)
                return res.json({
                    status: 'success',
                    code: HttpCode.OK,
                    data: {
                        message: 'Resubmitted success'
                    }
                })
            }
            return res.status(HttpCode.BAD_REQUEST).json({
                status: 'error',
                code: HttpCode.BAD_REQUEST,
                message: 'Email has been verified'
            })
        }
        return res.status(HttpCode.NOT_FOUND).json({
            status: 'error',
            code: HttpCode.NOT_FOUND,
            message: 'User not found'

        })
    } catch (error) {
        next(error)

    }
}

module.exports = {
    reg,
    login,
    logout,
    getCurrentUser,
    verify,
    repeatEmailVerification
}