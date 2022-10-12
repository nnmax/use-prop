import { renderHook } from "@testing-library/react";
import useProp from "./use-prop";

test("The state should be reassigned after the change in props", () => {
  const user = { name: "Maxin", id: "1" };
  const { result, rerender } = renderHook(
    (initialProps) => useProp(initialProps.user),
    {
      initialProps: { user },
    }
  );
  const [state] = result.current;
  expect(state).toBe(user);

  const user2 = { name: "Alice", id: "2" };
  rerender({ user: user2 });

  const [state2] = result.current;
  expect(state2).toBe(user2);
});

test("If the props don't change, the state shouldn't change either", () => {
  const user = { name: "Maxin", id: "1" };
  const { result, rerender } = renderHook(
    (initialProps) => useProp(initialProps.user),
    {
      initialProps: { user },
    }
  );

  rerender({ user });

  const [state] = result.current;
  expect(state).toBe(user);
});
