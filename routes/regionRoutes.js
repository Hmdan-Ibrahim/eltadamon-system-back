import { Router } from 'express';
import { createRegion, deleteRegion, getAllRegions, getRegion, getCountRegionDocs, updateRegion } from '../controllers/regionController.js';
import { protect } from '../middleware/protect.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { Roles } from '../util/Roles.js';

const regionRoutes = Router();
regionRoutes.use(protect)
regionRoutes.get('/count', restrictTo(Roles.ADMIN, Roles.MANAGER), getCountRegionDocs)
regionRoutes.route('/')
    .post(restrictTo(Roles.ADMIN), createRegion)
    .get(restrictTo(Roles.ADMIN, Roles.MANAGER), getAllRegions);
regionRoutes.route('/:id')
    .get(restrictTo(Roles.ADMIN, Roles.MANAGER, Roles.REGION_MANAGER), getRegion)
    .patch(restrictTo(Roles.ADMIN), updateRegion)
    .delete(restrictTo(Roles.ADMIN), deleteRegion);

export default regionRoutes;