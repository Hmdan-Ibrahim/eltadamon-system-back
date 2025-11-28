import { Router } from 'express';
import { deleteProject, getAllProjects, getProject, updateProject } from '../controllers/projectController.js';
import { protect } from '../middleware/protect.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { Roles } from '../util/Roles.js';
import { createNeighbordhood, updateNeighbordhood } from '../controllers/neighbordhoodController.js';

const neighbordhoodRoutes = Router();

// neighbordhoodRoutes.use(protect)
neighbordhoodRoutes.route('/')
    // .post(restrictTo(Roles.MANAGER, Roles.REGION_MANAGER), createProject)
    .post(createNeighbordhood)
    .get(getAllProjects);

neighbordhoodRoutes.route('/:id')
    .get(getProject)
    // .patch(restrictTo(Roles.MANAGER, Roles.REGION_MANAGER), updateProject)
    .patch(updateNeighbordhood)
    .delete(restrictTo(Roles.MANAGER, Roles.REGION_MANAGER), deleteProject);

export default neighbordhoodRoutes;