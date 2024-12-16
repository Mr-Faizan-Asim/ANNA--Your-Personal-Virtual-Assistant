const express = require("express");
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    loginUser,
} = require("../controllers/UserController");

const router = express.Router();

// CRUD Routes
router.route("/users").post(createUser).get(getAllUsers);
router
    .route("/users/:id")
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

// Authentication Routes
router.post("/users/login", loginUser);

module.exports = router;
