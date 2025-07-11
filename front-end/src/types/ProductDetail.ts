export interface Product {
  id: string;
  name: string;
  price: number;
  images: {
    main: string;
    thumbnails: string[];
  };
  sku: string;
  inStock: boolean;
  colors: {
    name: string;
    value: string;
    isSelected?: boolean;
  }[];
  sizes: {
    name: string;
    weight: string;
    isSelected?: boolean;
  }[];
  description: string;
  features: string;
  reviews: any[];
}


export interface ProductDetailResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  brandName: string;
  categoryName: string;
  status: string;
  thumbnailUrl: string;
  imagesUrl: string[]; // chứa tất cả ảnh phụ
  starRated: number;
  stock: number;
}

export interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  isFavorite?: boolean;
}




// export interface Product {
//   id: string;
//   name: string;
//   price: number;
//   images: {
//     main: string;
//     thumbnails: string[];
//   };
//   sku: string;
//   inStock: boolean;
//   colors: {
//     name: string;
//     value: string;
//     isSelected?: boolean;
//   }[];
//   sizes: {
//     name: string;
//     weight: string;
//     isSelected?: boolean;
//   }[];
//   description: string;
//   features: string;
//   reviews: any[];
// }

