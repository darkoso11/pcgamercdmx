import { Category, Product } from './products-admin.service';

export function getAdminProductCategoryLabel(
  product: Product,
  categories: Category[]
): string {
  const subcategory = categories
    .flatMap((category) => category.subcategories)
    .find((item) => item._id === product.subcategoryId);
  if (subcategory) {
    return subcategory.name;
  }

  const category = categories.find((item) => item._id === product.categoryId);
  if (category) {
    return category.name;
  }

  switch (product.category) {
    case 'paquetes':
      return 'Ensambles';
    case 'perifericos':
      return 'Periféricos';
    case 'componentes':
    default:
      return 'Componentes';
  }
}
