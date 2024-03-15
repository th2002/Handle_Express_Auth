import { CONNECT_REDIS } from "~/config/redis";

const setRefreshToken = async (userId, refreshToken) => {
  const redis_client = CONNECT_REDIS();

  const result = redis_client.get(userId, async (err, result) => {
    if (err) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err);
    }

    await redis_client.set(userId, refreshToken);
    return result;
  });

  return result;
};

const getRefreshToken = async (key) => {
  const redis_client = CONNECT_REDIS();
  const result = await redis_client.get(key, async (err, refreshToken) => {
    if (err) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err);
    }

    return refreshToken;
  });
  return result;
};

const deleteRefreshToken = async (userId) => {
  const redis_client = CONNECT_REDIS();
  const result = await redis_client.del(userId);
  return result;
};

export const setBlacklistToken = async (userId, token) => {
  const redis_client = CONNECT_REDIS();
  const result = await redis_client.set(`blacklist_${userId}`, token);
  return result;
};

export const isTokenBlacklisted = async (userId, token) => {
  const redis_client = CONNECT_REDIS();
  const result = await redis_client.get(`blacklist_${userId}`);
  return result === token;
};

export const delBlacklistToken = async (userId) => {
  const redis_client = CONNECT_REDIS();
  const result = await redis_client.del(`blacklist_${userId}`);
  return result;
};

export const redis_utils = {
  setRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  setBlacklistToken,
  isTokenBlacklisted,
  delBlacklistToken,
};

