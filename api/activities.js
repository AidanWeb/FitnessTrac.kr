const express = require('express');
const activitiesRouter = express.Router();
const { getAllActivities, createActivity, updateActivity, getPublicRoutinesByActivity} = require('../db');
const { requireUser } = require('./utils');

activitiesRouter.use((req, res, next) => {
    console.log('> A request has been made to the /activities endpoint');

    next();
})

activitiesRouter.get('/', async (req, res, next) => {
    try {
        const activities = await getAllActivities();

        res.send({activities})
    } catch (e) {
        console.error(e);
        next(e);
    }
})

activitiesRouter.post('/', requireUser, async (req, res, next) => {
    const { name, description } = req.body;

    try {
        const newActivity = await createActivity({name, description});

        res.send({newActivity});
    } catch (e) {
        if (e.code == '23505') {
            next({
                name: 'activityExists',
                message: 'This activity already exists'
            })
        }
        next(e);
    }
})

activitiesRouter.patch('/:activityId', requireUser, async (req, res, next) => {
    const { activityId } = req.params;
    const { name, description } = req.body;
    console.log( activityId, name, description)

    try {
        const updatedActivity = await updateActivity({activityId, name, description});

        res.send({updatedActivity});
    } catch (e) {
        console.error(e)
        next(e);
    }
})

activitiesRouter.get('/:activityId/routines', async (req, res, next) => {
    const { activityId } = req.params;

    try {
        const routines = await getPublicRoutinesByActivity({activityId});

        res.send({routines});
    } catch (e) {
        console.error(e)
        next(e);
    }
})

module.exports = activitiesRouter;