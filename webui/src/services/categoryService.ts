import { Category } from "@/models/Category";
import useClientFetch from "./fetch";

export const useCategoriesService = () => {
  const {get, getOne, post, put, _delete} = useClientFetch()

  const getCategories = (categoryId: string) => {
      return get(`/Categories/${categoryId}`)
  }

  const createCategory = async (category: Category) => {
    return post (`/Categories`, category)
  };

  const putCategory = async (category: Category) => {
    const copyCategory: Category = {
      id: category.id+100,
      name: category.name,
      signUpFrom: category.signUpFrom,
      signUpTo: category.signUpTo
    }
  
    return put(`/Categories/${category.id}`, copyCategory)
  };

  const deleteCategory = async (categoryId: string) => {
    return _delete(`/Categories/${categoryId}`,)
  };

  return {
    getCategories,
    createCategory,
    putCategory,
    deleteCategory
  }
}




