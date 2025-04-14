/*
const Users = require("../models/mongodb/secusers-model");

module.exports = {
  // GET todos los usuarios
  getAllUsers: async (req, res) => {
    try {
      const users = await Users.find();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET por ID
  getUserById: async (req, res) => {
    const { userid } = req.query;
    try {
      const user = await Users.findOne({ USERID: userid });
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // POST crear usuario
  createUser: async (req, res) => {
    try {
      const newUser = new Users(req.body);
      await newUser.save();
      res.status(201).json(newUser);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // PATCH actualizar usuario
  updateUser: async (req, res) => {
    const { userid } = req.query;
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { USERID: userid },
        { $set: req.body },
        { new: true }
      );
      if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // PATCH borrado lógico
  deleteUserLogic: async (req, res) => {
    const { userid } = req.query;
    try {
      const user = await Users.findOneAndUpdate(
        { USERID: userid },
        {
          "DETAIL_ROW.ACTIVED": false,
          "DETAIL_ROW.DELETED": true,
        },
        { new: true }
      );
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      res.status(200).json({ message: "Borrado lógicamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE físico
  deleteUser: async (req, res) => {
    const { userid } = req.query;
    try {
      const deleted = await Users.findOneAndDelete({ USERID: userid });
      if (!deleted) return res.status(404).json({ message: "Usuario no encontrado" });
      res.status(200).json({ message: "Borrado físicamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
*/
/*
const Users = require("../models/mongodb/secusers-model");

module.exports = {
  // GET todos los usuarios
  getAllUsers: async (req, res) => {
    try {
      const users = await Users.find();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // POST crear usuario
  createUser: async (req, res) => {
    try {
      const newUser = new Users(req.body);
      await newUser.save();
      res.status(201).json(newUser);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // PUT actualizar usuario
  updateUser: async (req, res) => {
    const { userid } = req.query;
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { USERID: userid },
        { $set: req.body },
        { new: true }
      );
      if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // DELETE borrar usuario lógicamente
  deleteUserLogic: async (req, res) => {
    const { userid } = req.query;
    try {
      const user = await Users.findOneAndUpdate(
        { USERID: userid },
        {
          "DETAIL_ROW.ACTIVED": false,
          "DETAIL_ROW.DELETED": true,
        },
        { new: true }
      );
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      res.status(200).json({ message: "Borrado lógicamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE borrar usuario físicamente
  deleteUser: async (req, res) => {
    const { userid } = req.query;
    try {
      const deleted = await Users.findOneAndDelete({ USERID: userid });
      if (!deleted) return res.status(404).json({ message: "Usuario no encontrado" });
      res.status(200).json({ message: "Borrado físicamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
*/

const Users = require("../models/mongodb/secusers-model");

module.exports = (srv) => {
  // GET todos los usuarios
  srv.on("getall", async (req) => {
    try {
      const users = await Users.find();
      return users;
    } catch (err) {
      req.error(500, "Error al obtener usuarios: " + err.message);
    }
  });

  // POST crear usuario
  srv.on("create", async (req) => {
    try {
      const newUser = new Users(req.data); // `req.data` en lugar de `req.body`
      await newUser.save();
      return newUser;
    } catch (err) {
      req.error(400, "Error al crear usuario: " + err.message);
    }
  });

  // PUT actualizar usuario
  srv.on("update", async (req) => {
    const { USERID } = req.data;
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { USERID },
        { $set: req.data },
        { new: true }
      );
      if (!updatedUser) req.error(404, "Usuario no encontrado");
      return updatedUser;
    } catch (err) {
      req.error(400, "Error al actualizar usuario: " + err.message);
    }
  });

  // DELETE lógico
  srv.on("deletelogic", async (req) => {
    const { USERID } = req.data;
    try {
      const user = await Users.findOneAndUpdate(
        { USERID },
        {
          $set: {
            "DETAIL_ROW.ACTIVED": false,
            "DETAIL_ROW.DELETED": true,
          },
        },
        { new: true }
      );
      if (!user) req.error(404, "Usuario no encontrado");
      return { message: "Usuario borrado lógicamente" };
    } catch (err) {
      req.error(500, "Error al borrar usuario lógicamente: " + err.message);
    }
  });

  // DELETE físico
  srv.on("delete", async (req) => {
    const { USERID } = req.data;
    try {
      const deleted = await Users.findOneAndDelete({ USERID });
      if (!deleted) req.error(404, "Usuario no encontrado");
      return { message: "Usuario borrado físicamente" };
    } catch (err) {
      req.error(500, "Error al borrar usuario: " + err.message);
    }
  });
};
