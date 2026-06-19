import jwt from "jsonwebtoken";

export const genarateAccessToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
    },
    process.env.JWT_ACCESS_TOKEN,
    { expiresIn: "1d" },
  );
};

export const genarateRefreshToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
    },
    process.env.JWT_REFRESH_TOKEN,
    { expiresIn: "7d" },
  );
};
