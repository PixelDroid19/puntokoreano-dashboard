import axios from "axios";
import ENDPOINTS from "../api";

export const getGroups = async () => {
  try {
    const result = await axios.get(ENDPOINTS.GROUPS.GET_ALL.url);
    if (result.status === 200) {
      return result?.data;
    }
  } catch (err) {
    console.log(err);
  }
};
