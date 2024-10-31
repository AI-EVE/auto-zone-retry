"use server";

import { AUTH_TOEKN_NAME, PAGE_SIZE } from "@lib/constants";
import { getAllCategories } from "@lib/data-service";
import { getToken } from "@lib/helper";
import {
  Category,
  CreateProductBought,
  CreateProductProps,
  EditProduct,
  Product,
  ProductBoughtSchema,
  ProductImage,
} from "@lib/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createRestockingBillAction } from "./restockingBillActions";

interface GetProdcutsBoughtActionProps {
  pageNumber?: string;
  name?: string;
  shopName?: string;
  dateOfOrderFrom?: string;
  dateOfOrderTo?: string;
  minTotalPrice?: string;
  maxTotalPrice?: string;
}

export async function getProductsBoughtAction({
  pageNumber,
  name,
  dateOfOrderFrom,
  dateOfOrderTo,
  minTotalPrice,
  maxTotalPrice,
}: GetProdcutsBoughtActionProps) {
  //Product?PageNumber=1&PageSize=10
  // /api/Product?Name=test&CategoryId=1&ProductTypeId=1&ProductBrandId=1&IsAvailable=true&PageNumber=1&PageSize=10
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  let query = `${process.env.API_URL}/api/ProductBought?&PageSize=${PAGE_SIZE}`;

  if (name) query = query + `&Name=${name}`;
  if (pageNumber) query = query + `&PageNumber=${pageNumber}`;

  if (dateOfOrderFrom) query = query + `&dateOfOrderFrom=${dateOfOrderFrom}`;

  if (dateOfOrderTo) query = query + `&dateOfOrderTo=${dateOfOrderTo}`;

  if (minTotalPrice) query = query + `&minTotalPrice=${minTotalPrice}`;

  if (maxTotalPrice) query = query + `&maxTotalPrice=${maxTotalPrice}`;

  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
    next: {
      // revalidate: 3600,
      tags: [
        "productsBought",
        // `${pageNumber}`,
        // `${name}`,
        // `${categoryId}`,
        // `${productTypeId}`,
        // `${productBrandId}`,
        // `${isAvailable}`,
      ],
    },
  });

  // console.log(response, "Product Response");
  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const categories = await getAllCategories();

  const data = (await response.json()) as Product[];

  const productsWithCategories = data.map((product) => {
    const category = categories.find(
      (cat: Category) => cat.id === product.categoryId
    ).name;
    return { ...product, category: category };
  });

  return { data: productsWithCategories, error: "" };
}

export async function getProductByIdAction(id: string) {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(`${process.env.API_URL}/api/Product/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-type": "application/json",
    },
  });

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

export async function createProductBoughtBulkAction({
  data,
  shopName,
}: {
  data: z.infer<typeof ProductBoughtSchema>[];
  shopName: string;
}) {
  //   console.log(data, ">>>>>>>>>>");
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";

  if (!token) return redirect("/login");

  const shopData = await createRestockingBillAction(shopName);

  const productsBoughtArr = data.map((product) => {
    return { ...product, productsRestockingBillId: shopData.id };
  });

  const response = await fetch(
    `${process.env.API_URL}/api/ProductsBought/bulk`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productsBoughtArr),
    }
  );

  console.log(response);
  if (!response.ok) throw new Error("Had truble creating a product.");

  //   const { prodcutId } = await response.json();

  revalidateTag("productBought");
}

export async function editProductAction({
  productToEdit,
  imagesToUpload,
  imagesToDelete,
  isMain,
  isEqual,
}: {
  productToEdit: EditProduct;
  imagesToUpload: FormData[];
  imagesToDelete: ProductImage[];
  isEqual: boolean;
  isMain?: ProductImage | null;
}) {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";

  if (!token) return redirect("/login");

  if (!isEqual) {
    const response = await fetch(
      `${process.env.API_URL}/api/Product/${productToEdit.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productToEdit),
      }
    );

    console.log(response);
    if (!response.ok) throw new Error("Had truble creating a product.");
  }

  if (imagesToUpload.length) {
    const upload = imagesToUpload.map((image) =>
      createProductImageAction(image)
    );
    await Promise.all(upload);
  }

  if (imagesToDelete.length) {
    const deleteImages = imagesToDelete.map((deletedImage) =>
      deleteProductsImageAction(deletedImage.id)
    );

    await Promise.all(deleteImages);
  }

  if (isMain) {
    await setProductImageAsMain(isMain.id);
  }

  revalidatePath(`/products/${productToEdit.id}`);
  revalidateTag("products");
}

export async function deleteProductsByIdAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token) throw new Error("You are not authorized to make this action.");

  const response = await fetch(`${process.env.API_URL}/api/Product/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-type": "application/json",
    },
  });

  if (!response.ok)
    throw new Error(`Failed to delete a product with the id of ${id} `);
  // const data = await response.json();

  // return data;
  revalidatePath("/products");
}

interface GetProdcutsCountActionProps {
  name?: string;
  categoryId?: string;
  productTypeId?: string;
  productBrandId?: string;
  isAvailable?: string;
}

export async function getProductsCountAction({
  name,
  categoryId,
  productTypeId,
  productBrandId,
  isAvailable,
}: GetProdcutsCountActionProps) {
  //Product?PageNumber=1&PageSize=10

  // const token = getToken();

  // if (!token)
  //   return {
  //     data: null,
  //     error: "You are not authorized to get the products count data.",
  //   };

  let query = `${process.env.API_URL}/api/Product/count?`;

  if (name) query = query + `&Name=${name}`;

  if (categoryId) query = query + `&CategoryId=${categoryId}`;

  if (productTypeId) query = query + `&ProductTypeId=${productTypeId}`;

  if (productBrandId) query = query + `&ProductBrandId=${productBrandId}`;

  if (isAvailable) query = query + `&IsAvailable=${isAvailable}`;

  const response = await fetch(query, {
    method: "GET",
    // headers: {
    //   Authorization: `Bearer ${token}`,
    //   // "Content-type": "application/json",
    // },
  });

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products count.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products count.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

/// PRODUCT IMAGES.

export async function getProductsImageAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  // const token = getToken();

  // if (!token)
  //   return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/${id}`,
    {
      method: "GET",
      // headers: {
      //   Authorization: `Bearer ${token}`,
      //   // "Content-type": "application/json",
      // },
    }
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

export async function createProductImageAction(formData: FormData) {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";

  if (!token) return redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/ProductImages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  console.log(response);
  if (!response.ok) throw new Error("Had truble creating a product.");
}

export async function deleteProductsImageAction(imageId: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token) throw new Error("You are not authorized to do this action.");

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/${imageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    throw new Error("Something went wrong while deleting product images.");
  }
}

/// WTF IS THIS ?

export async function getProductsImagesMainAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/main/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  console.log(data, "DATA");
  return { data, error: "" };
}

export async function setProductImageAsMain(id: number) {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  await fetch(`${process.env.API_URL}/api/ProductImages/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-type": "application/json",
    },
  });
}

export async function deleteProductsImageMainAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/main/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  console.log(data, "DATA");
  return { data, error: "" };
}