export const cleanTimestamp = (timestamp) => {
    return timestamp.replace('T', ' ').replace('Z', ' ');
}

export const cropStringWithEllipsis = (text, lengthWithEllipsis) => {
    if(!text || text.length === '') return 'N/A';

    return text.length > lengthWithEllipsis ? text.substring(0, (lengthWithEllipsis - 3)) + '\u2026' : text;
}

export const cleanBytesString = (bytes, decimals = 2) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (!bytes || bytes === 0) {
        return '0 B';
    }
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}