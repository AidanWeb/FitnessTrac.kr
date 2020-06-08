const express = require('express');
const usersRouter = express.Router();
const { getUser, getUserByUsername, createUser, getPublicRoutinesByUser, getAllUsers } = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const bodyParser = require('body-parser')
usersRouter.use(bodyParser.json());

usersRouter.use((req, res, next) => {
    console.log('> A request has been made to the /users endpoint');

    next();
})

usersRouter.get('/', async (req, res, next) => {
    try {
        const data = await getAllUsers();
        const users = data.map((user) => {
            delete user.password;
            return user;
        })
        res.send({users})
    } catch (e) {
        console.log(e);
        next(e)
    }
})

usersRouter.post('/register', async (req, res, next) => {
    const { username, password } = req.body;
    console.log(`> UN: ${username}`)

    if (!username || !password) {
        next({
            name: `usernameAndPassowrdRequired`,
            message: `A username and password are required to create an account`
        })
    } else if (password.length < 8) {
        next({
            name: `invalidPassword`,
            message: `Your password must be 8 characters or more`
        })
    }

    try {
        const _user = await getUserByUsername(username);

        if (_user) {
            next({
                name: 'UserExistsError',
                message: 'A user by that username already exists'
            });
        }

        const user = await createUser({
            username,
            password,
        });

        const token = jwt.sign({
            id: user.id,
            username
        }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        })

        res.send({
            message: 'Thank you for creating an account',
            token
        })
    } catch (e) {
        console.log(e);
        next(e);
    }
});

usersRouter.post('/login', async (req, res, next) => {
    const {username, password} = req.body;

    if (!username || !password) {
        next({
            name: 'UsernameAndPasswordRequired',
            message: "A username and password are required to log in"
        })
    }
    try {
        const user = await getUser({username, password});
        console.log(`>>> User: `, user)
        const { id, username: un } = user;

        if (user) {
            const token = jwt.sign({id, un}, JWT_SECRET);
            res.send({ message: "you're logged in!", token });
        } else {
            next({ 
                name: 'IncorrectCredentialsError', 
                message: 'Username or password is incorrect'
          });
        }
    } catch(error) {
        console.log(error);
        next(error);
    }
});

usersRouter.get(`/:username/routines`, async (req, res, next) => {
    const { username } = req.params;

    try {
        const routines = await getPublicRoutinesByUser(username);
        res.send(routines);
    } catch(error) {
        console.log(error);
        next(error);
    }
})


module.exports = usersRouter;