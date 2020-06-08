// API INDEX.JS (ROUTER)
const express = require('express');
const apiRouter = express.Router();
const bodyParser = require('body-parser')
apiRouter.use(bodyParser.json());

const jwt = require('jsonwebtoken');
const { getUserById } = require('../db')
const { JWT_SECRET } = process.env;

apiRouter.use(async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');
    
    if (!auth) {
        next();
    } else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length);

        try {
            const {id} = jwt.verify(token, JWT_SECRET);

            if (id) {
                req.user = await getUserById(id);
                next();
            }
        } catch ({name, message}) {
            next({name, message});
        }
    } else {
        next({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${ prefix }`
        });
    };
});

apiRouter.use((req, res, next) => {
    if(req.user) {
        console.log(`user exists`, req.user);
    };

    next();
})

//users:
const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);
//activities:
const activitiesRouter = require('./activities');
apiRouter.use('/activities', activitiesRouter);
//routines:
const routinesRouter = require('./routines');
apiRouter.use('/routines', routinesRouter);
//routine_activities:
const routineActivitiesRouter = require('./routine_activities');
apiRouter.use('/routine_activities', routineActivitiesRouter);

apiRouter.use((error, req, res, next) => {
    res.send(error);
});

module.exports = apiRouter