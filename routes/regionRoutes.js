import { Router } from 'express';
import { createRegion, deleteRegion, getAllRegions, getRegion, updateRegion } from '../controllers/regionController.js';
import { protect } from '../middleware/protect.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { Roles } from '../util/Roles.js';

const regionRoutes = Router();
regionRoutes.use(protect, restrictTo(Roles.MANAGER))
regionRoutes.route('/')
    .post(createRegion)
    .get(getAllRegions);

regionRoutes.route('/:id')
    .get(restrictTo(Roles.REGION_MANAGER), getRegion)
    .patch(updateRegion)
    .delete(deleteRegion);

export default regionRoutes;