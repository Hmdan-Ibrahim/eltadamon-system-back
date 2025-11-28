export function filter(query, queryParams) {
    const queryObj = { ...queryParams };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    // if (queryObj.date) {
    //     const date = new Date(queryObj.date);
    //     const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    //     const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    //     delete queryObj.date
    //     queryObj.sendingDate = { gte: startOfDay, lte: endOfDay };
    // }

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    return query.find(JSON.parse(queryStr));
}