const secUsersModel = require('../models/mongodb/sec-users-model')

// Obtener todos los usuarios
async function getAllUsers(req) {
    try {
        const query = req.req.query || {}
        const users = await secUsersModel.find(query).lean()
        return users
    } catch (error) {
        return { error: error.message }
    }
}

// Agregar uno o más usuarios
async function addUsers(req) {
    try {
        const newUsers = req.req.body.users
        const result = await secUsersModel.insertMany(newUsers, { ordered: true })
        return result
    } catch (error) {
        return { error: error.message }
    }
}

// Actualizar un usuario por USERID
async function updateUser(req) {
    try {
        const userid = parseInt(req.req.query.USERID)
        const updatedData = req.req.body.user
        const result = await secUsersModel.updateOne({ USERID: userid }, updatedData)
        return result
    } catch (error) {
        return { error: error.message }
    }
}

// Eliminar un usuario por USERID
async function deleteUser(req) {
    try {
        const userid = parseInt(req.req.query.USERID)
        const result = await secUsersModel.deleteOne({ USERID: userid })
        return result
    } catch (error) {
        return { error: error.message }
    }
}

module.exports = {
    getAllUsers,
    addUsers,
    updateUser,
    deleteUser
}
