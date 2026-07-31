export function resolveTaxonomyReference(value, blogItems, legacyItems) {
  if (value === null || value === undefined || value === '') {
    return { alreadyMigrated: false, item: null, name: '' };
  }

  const normalizedValue = String(value).trim();
  const blogItem = blogItems.find((item) =>
    String(item.id) === normalizedValue ||
    item.slug === normalizedValue ||
    String(item.name || '').toLowerCase() === normalizedValue.toLowerCase()
  );
  if (blogItem) {
    return {
      alreadyMigrated: true,
      item: blogItem,
      name: String(blogItem.name || normalizedValue).trim(),
    };
  }

  const matched = legacyItems.find((item) =>
    String(item.id) === normalizedValue || item.slug === normalizedValue
  );
  return {
    alreadyMigrated: false,
    item: null,
    name: String(matched?.name || normalizedValue).trim(),
  };
}
