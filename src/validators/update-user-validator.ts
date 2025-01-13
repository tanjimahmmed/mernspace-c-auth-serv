import { checkSchema } from 'express-validator'

export default checkSchema({
    firstName: {
        errorMessage: 'First Name is required',
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: 'Last Name is required',
        notEmpty: true,
        trim: true,
    },
    role: {
        errorMessage: 'Role is required!',
        notEmpty: true,
        trim: true,
    },
})
