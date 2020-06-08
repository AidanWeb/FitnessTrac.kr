const express = require('express');
const routinesRouter = express.Router();
const { getRoutineById, getPublicRoutines, createRoutine, addActivityToRoutine, updateRoutine, destroyRoutine } = require('../db');
const { requireUser } = require('./utils');

routinesRouter.use((req, res, next) => {
    console.log('> A request has been made to the /routines endpoint');
    next();
})

routinesRouter.get('/', async(req, res, next) => {
    try {
        const routines = await getPublicRoutines();
        res.send({routines});
    } catch (e) {
        console.error(e);
        next(e);
    }
})

routinesRouter.post('/', requireUser, async (req, res, next) => {
    const { id: creatorId } = req.user;
    const { public, name, goal } = req.body;

    try {
        const routine = await createRoutine({creatorId, public, name, goal})

        res.send({routine})
    } catch (e) {
        if (e.code == '23505') {
            next({
                name: 'routineExists',
                message: 'This routine already exists'
            })
        }
        next(e);
    }
})

routinesRouter.post('/:routineId/activities', async (req, res, next) => {
    const { routineId } = req.params;
    const { activityId, duration, count } = req.body;

    try {
        const routine = await addActivityToRoutine({routineId, activityId, duration, count})

        res.send({routine})
    } catch (e) {
        if (e.code == '23505') {
            next({
                name: 'activityPreexistingInRoutine',
                message: 'This activity has already been added to the routine'
            })
        } else if (e.code == '23503') {
            next({
                name: 'routineDoesNotExist',
                message: `A routine with the ID of ${routineId} could not be found`
            })
        }
        next(e);
    }
})

routinesRouter.patch('/:routineId', requireUser, async (req, res, next) => {
    const { routineId: id } = req.params;
    const { public, name, goal} = req.body;
    const { user } = req.user;
    console.log('>>user: ', user)

    try {
        const { creatorId } = await getRoutineById({id})
        if (creatorId !== user.id) {
            next({
                name: 'UserIsNotCreator',
                message: 'Only the creator can make changes to a routine'
            })
        }
        const routine = await updateRoutine({id, public, name, goal});
        res.send({message: "routineUpdated", routine});
    } catch (e) {
        console.error(e)
        next(e);
    }
})

routinesRouter.delete('/:routineId', requireUser, async (req, res, next) => {
    const { routineId: id } = req.params;
    const user = req.user;
    console.log('>>user: ', user)

    try {
        const [{ creatorId }] = await getRoutineById({id})
        if (creatorId !== user.id) {
            next({
                name: 'UserIsNotCreator',
                message: 'Only the creator can make changes to a routine'
            })
        }
        await destroyRoutine(id);
        res.send({message: "Routine Successfully Deleted"});
    } catch (e) {
        console.error(e)
        next(e);
    }
})

module.exports = routinesRouter;