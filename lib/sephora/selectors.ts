// Centralized selectors for Sephora product pages. Update here when layout shifts.
export const selectors = {
  productLink: 'a[href*="/p/"]',
  titleSel: 'h1[data-at*=product_name], h1.ProductHero__name, h1',
  brandSel: '[data-at*=brand_name], .ProductBrand',
  priceSel: '[data-at*=price], .ProductPrice-current',
  comparePriceSel: '[data-at*=list_price], .ProductPrice-original',
  descSel: '[data-comp="ProductDetailDescription"]',
  ingredientsSel: '[data-comp="ProductDetailIngredients"], [data-at*=ingredients]',
  imageSel: 'img[src*="/product"]',
  ratingSel: '[data-at*=rating], .Rating-star',
  reviewsCountSel: '[data-at*=reviews_count], .Rating-reviewsCount'
};
