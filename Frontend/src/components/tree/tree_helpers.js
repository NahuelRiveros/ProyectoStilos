export function buildTree({
  rows = [],
  idKey = "id",
  parentKey = "parent_id",
  labelKey = "nombre",
}) {
  const map = new Map();
  const roots = [];

  rows.forEach((row) => {
    map.set(row[idKey], {
      ...row,
      id: row[idKey],
      label: row[labelKey],
      children: [],
    });
  });

  rows.forEach((row) => {
    const node = map.get(row[idKey]);
    const parentId = row[parentKey];

    if (parentId && map.has(parentId)) {
      map.get(parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}