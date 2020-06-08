const express = require('express');
const routineActivitiesRouter = express.Router();
const { getUserByRoutineActivityId, updateRoutineActivity, destroyRoutineActivity } = require('../db');
const {requireUser} = require('./utils')

routineActivitiesRouter.use((req, res, next) => {
    console.log('> A request has been made to the /routine_activities endpoint');
    next();
})

routineActivitiesRouter.patch('/:routineActivityId', requireUser, async (req, res, next) => {
    const { routineActivityId: id } = req.params;
    const { count, duration } = req.body;
    const user = req.user;
    console.log('>>user: ', user)

    try {
        const [{id: creator}] = await getUserByRoutineActivityId(id)
        console.log(creator)
        if (creator !== user.id) {
            next({
                name: 'UserIsNotCreator',
                message: 'Only the creator can make changes to a routine'
            })
        }
        const routineActivity = await updateRoutineActivity({id, count, duration});
        res.send({message: "routineActivityUpdated", routineActivity});
    } catch (e) {
        console.error(e)
        next(e);
    }
})

routineActivitiesRouter.delete('/:routineActivityId', requireUser, async (req, res, next) => {
    const { routineActivityId: id } = req.params;
    const user = req.user;
    console.log('>>user: ', user)

    try {
        const [{id: creator}] = await getUserByRoutineActivityId(id)
        console.log(creator)
        if (creator !== user.id) {
            next({
                name: 'UserIsNotCreator',
                message: 'Only the creator can make changes to a routine'
            })
            return;
        }
        await destroyRoutineActivity(id);
        res.send({message: "routineActivityDeleted"});
    } catch (e) {
        console.error(e)
        next(e);
    }
})


module.exports = routineActivitiesRouter;