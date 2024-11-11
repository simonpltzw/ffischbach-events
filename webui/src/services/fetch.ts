import { ResponseException } from "@/util/exceptions";
import useToken from "./tokenService";
import { ResponseError } from "@/util/types";

type T = any;

const useClientFetch = () => {
  const { getToken } = useToken();

  const get = async (path: string): Promise<T> => {
    const token = await getToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_WEB_API}${path}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ResponseException(result as ResponseError);
    }

    return result;
  };

  const getOne = async (path: string): Promise<T> => {
    const token = await getToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_WEB_API}${path}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ResponseException(result as ResponseError);
    }

    return result;
  };

  const post = async (path: string, data?: T): Promise<T> => {
    const token = await getToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_WEB_API}${path}`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ResponseException(result as ResponseError);
    }

    return result;
  };

  const put = async (path: string, data: T): Promise<T> => {
    const token = await getToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_WEB_API}${path}`, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ResponseException(result as ResponseError);
    }

    return result;
  };

  const _delete = async (path: string): Promise<T> => {
    const token = await getToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_WEB_API}${path}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ResponseException(result as ResponseError);
    }

    return result;
  };

  return {
    get,
    getOne,
    post,
    put,
    _delete,
  };
};

export default useClientFetch;
