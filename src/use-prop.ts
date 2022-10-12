import React, { useState, useRef, useEffect } from "react";

export type UsePropResult<T> = [
  T,
  React.Dispatch<React.SetStateAction<T>>
];

const useProp = <T>(prop: T): UsePropResult<T> => {
  const [state, setState] = useState<T>(prop);
  const previousPropRef = useRef<T>();

  if (prop !== previousPropRef.current && prop !== state) {
    setState(prop);
  }

  useEffect(() => {
    previousPropRef.current = prop;
  }, [prop]);

  return [state, setState];
};

export default useProp;
