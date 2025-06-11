import Axios from "axios";

export const api = Axios.create({
  baseURL: "https://4wa3vsedr2.execute-api.us-east-1.amazonaws.com/dev",
});
