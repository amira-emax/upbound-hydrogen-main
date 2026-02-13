export function isProductionEnvironment() {
  return (
    process.env.PUBLIC_APP_ENV === 'production' ||
    process.env.NODE_ENV === 'production'
  );
}

export function isStagingProduct(product: { tags?: string[] }) {
  return product?.tags?.some(
    (tag) => tag.toLowerCase() === 'staging'
  );
}

export function filterStagingProducts(products: {
  nodes?: Array<{ tags?: string[] }>;
}) {
  if (!isProductionEnvironment()) return products;

  if (!products?.nodes) return products;

  return {
    ...products,
    nodes: products.nodes.filter(
      (product) => !isStagingProduct(product)
    ),
  };
}
