export function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("user", JSON.stringify(action.payload));
      return {
        ...state,
        isLogin: true,
        user: action.payload,
      };

    case "LOGOUT":
      localStorage.removeItem("isLogin");
      localStorage.removeItem("user");
      return {
        ...state,
        isLogin: false,
        user: {},
      };

    case "AUTH_RESOLVED":
      return {
        ...state,
        isAuthResolved: true,
      };

    default:
      return state;
  }
}
