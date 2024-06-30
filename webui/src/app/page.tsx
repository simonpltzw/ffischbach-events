"use client";

import { useRouter } from "next/navigation";
import { FC, useEffect } from "react";

const Root: FC<any> = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, []);

  return <></>;
};

export default Root;
