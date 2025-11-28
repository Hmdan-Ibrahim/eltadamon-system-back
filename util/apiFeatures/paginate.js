export function paginate(query, page, limit) {
    const Page = page * 1 || 1;
    const Limit = limit * 1 || 30;
    const Skip = (Page - 1) * Limit;

    return query.skip(Skip).limit(Limit);
}