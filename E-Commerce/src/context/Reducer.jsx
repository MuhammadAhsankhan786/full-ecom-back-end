export const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      // ✅ Store in localStorage
      localStorage.setItem("isLogin", true);
      localStorage.setItem("user", JSON.stringify(action.payload));

      return {
        ...state,
        isLogin: true,
        user: action.payload,
      };

    case "AUTH_RESOLVED":
      return { ...state, isAuthResolved: true };

    default:
      return state;
  }
};
