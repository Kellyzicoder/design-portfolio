// "HBD_Bishop-John 4.jpg" -> "HBD Bishop John 4"
export const nameFromFile = (file) =>
  (file || '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
