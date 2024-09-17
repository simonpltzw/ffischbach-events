"use client";

import { useRouter } from "next/navigation";
import { FC, useEffect } from "react";

const Root: FC<any> = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};

export default Root;
