export function getImageUrl(path) {

    if (!path)
        return "";

    if (path.startsWith("http"))
        return path;

    return `${process.env.R2_PUBLIC_URL}/${path}`;

}