import ENDPOINTS from "../api";
import { axiosInstance } from "../utils/axios-interceptor";

export const getGroups = async () => {
  try {
    const result = await axiosInstance.get(ENDPOINTS.GROUPS.GET_ALL.url);
    if (result.status === 200) {
      return result?.data;
    }
  } catch (err) {
    console.log(err);
  }
};
