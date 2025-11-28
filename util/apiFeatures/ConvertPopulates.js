export const convertPopulates = (query, populates) => {
    if (Array.isArray(populates))
        populates.forEach(populate => query = query.populate(populate))

    // else if (typeof populates === "object" && populates.path)
    //     query = query.populate(populates);

    else query = query.populate(populates);

    return query.lean();
}
