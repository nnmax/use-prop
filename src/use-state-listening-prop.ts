import React, { useState, useRef, useEffect } from "react";

export type StateListeningPropResult<T> = [
  T,
  React.Dispatch<React.SetStateAction<T>>
];

const useStateListeningProp = <T>(prop: T): StateListeningPropResult<T> => {
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

export default useStateListeningProp;
