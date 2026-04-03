import { useToast } from "@/context/toast";
import { ResponseError } from "@/util/types";
import { Dispatch, SetStateAction } from "react";

const useErrorHandler = () => {
  const { addToast } = useToast();

  const handleError = (error: ResponseError, setErrors?: Dispatch<SetStateAction<any[]>>) => {
    if (process.env.NODE_ENV == "development") {
      console.error(error);
    }

    if (error.title && !!setErrors) {
      setErrors([error.title]);
    }
    addToast({
      message: error.title,
      type: "error",
      traceId: error.traceId,
    });
  };

  return handleError;
};

export default useErrorHandler;
