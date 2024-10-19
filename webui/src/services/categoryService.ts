import axios, { AxiosResponse } from "axios";

export const createCategory = async (token: string, category: Category) => {
  const response: AxiosResponse<Category> = await axios.post(
    `${process.env.NEXT_PUBLIC_WEB_API}/Categories`,
    category,
    {
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const putCategory = async (token: string, category: Category) => {
  const copyCategory: Category = {
    id: category.id,
    name: category.name,
    signUpFrom: category.signUpFrom,
    signUpTo: category.signUpTo
  }

  const response: AxiosResponse<Category> = await axios.put(
    `${process.env.NEXT_PUBLIC_WEB_API}/Categories/${category.id}`,
    copyCategory,
    {
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data
};

export const deleteCategory = async (token: string, categoryId: string) => {
  const response: AxiosResponse<Category> = await axios.delete(
    `${process.env.NEXT_PUBLIC_WEB_API}/Categories/${categoryId}`,
    {
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data
};
