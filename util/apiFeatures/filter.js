export function filter(query, queryParams, extraFilter = {}, customExcludedFields) {
    const queryObj = { ...queryParams };
    const excludedFields = ['page', 'sort', 'limit', 'fields', ...customExcludedFields];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    return query.find({ ...JSON.parse(queryStr), ...extraFilter });
}