Contribution

### 介绍

这是一个解决外部 Props 更新到组件内部的 State 的方案，优雅的解决了 State 依赖外部 Props 并需要手动监听的问题。

### 安装

**use-state-listening-prop** 以 NPM 包的形式提供。

```shell
# 使用 npm
npm install use-state-listening-prop

# 使用 yarn
yarn add use-state-listening-prop
```

### 使用

```jsx
import React from 'react'
import useStateListeningProp from 'use-state-listening-prop'

const App = (props) => {
  const { user: userProp } = props
  const [user, setUser] = useStateListeningProp(userProp)
  return (
    <>
      <p>Name: {user.name}</p>
      <input
        type="text"
        placeholder="Enter Your Name"
        onKeyPress={(event) => {
          if (event.code === "Enter") {
            setUser((u) => ({ ...u, name: event.currentTarget.value }))
          }
        }}
      />
    <>
  )
}

export default App
```

### 为什么选择 use-state-listening-prop？

在您的项目中，是否有很多将 Props 或 Context 的更新同步到 State 的情况？

我们有多种方法处理这种情况，**use-state-listening-prop** 为以下方案的第三种：

1. 使用 useEffect 监听变化；
2. 使用 useRef 跟踪上一个值的变化；
3. 封装自定义 Hooks；

#### 使用 useEffect（ ❌ 最好不要）

您是不是经常在项目中看到这样的用法？

```tsx
import { useState, useRef, useEffect } from "react";

const Users = ({ users }) => {
  const [internalUsers, setInternalUsers] = useState(users);

  useEffect(() => {
    setInternalUsers(users);
  }, [users]);

  return (
    <ul>
      {internalUsers.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

这几行代码看起来非常的优雅：使用 useEffect 的第二个参数监听 users 的变化，然后重新设置 state，完美！✌️

可是您有没有想过，上面的代码会额外的触发了一次重渲染。🤔️

每当 users 变化时，直到整个应用加载完 DOM 后，useEffect 里的函数才会执行。由于我们调用了 `setInternalUsers`，这又会导致我们的程序额外的重渲染一次。

为了给用户提供一个加载更快、体验更好的应用程序，请不要这样做。

#### 使用 useRef（ ✅ ）

```tsx
import { useState, useRef, useEffect } from "react";

const Users = ({ users }) => {
  const [internalUsers, setInternalUsers] = useState(users);
  const previousUsersRef = useRef();

  if (users !== previousUsersRef.current && users !== internalUsers) {
    setInternalUsers(users);
  }

  useEffect(() => {
    previousUsersRef.current = users;
  }, [users]);

  return (
    <ul>
      {internalUsers.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

此写法用到了 `useRef` 来保存上一次更新的值，然后在渲染阶段判断更新前和更新后的值是否相同，如果不相同则设置 state。

从而在渲染前的阶段就完成了 state 的设置，避免了额外的渲染。

虽然比上一个写法多出了几行代码，但是在性能、用户体验（屏幕闪烁）上都优于第一种写法。

#### 自定义 Hooks （ ✅ ✅ ）

第二种写法虽然解决了我们的问题，但是其可维护性较低、耦合度较高。

这些逻辑全部写在了组件内部，后来的维护者们有可能因为修改其他问题，而使你写的功能失效或出现其他小问题；

或者您的组件不止监听一个 Props；

又或者其他组件也需要此功能；

对此，您应该将此逻辑抽离成自定义 Hooks。

```typescript
// File: useStateListeningProp.ts
import { useState, useRef, useEffect } from "react";

type StateListeningPropResult<T> = [T, React.Dispatch<React.SetStateAction<T>>];

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
```

像这样，就能在您的组件中使用了。

```tsx
// File: Users.tsx
import React from "react";
import useStateListeningProp from "./useStateListeningProp";

type User = { id: string; name: string };

const Users: React.FC<{ users: User[] }> = (props) => {
  const { users: usersProp } = props;

  const [users, setUsers] = useStateListeningProp(usersProp);

  const addUser = (userName: User["name"]) => {
    setUsers((oldUsers) =>
      oldUsers.concat({
        id: Date.now().toString(),
        name: userName,
      })
    );
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.code === "Enter") {
      addUser(event.currentTarget.value);
      event.currentTarget.value = "";
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter Your Name"
        onKeyPress={handleKeyPress}
      />
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};
```
