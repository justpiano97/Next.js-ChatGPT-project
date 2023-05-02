import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseDateType = {
  tokens: {
    refresh_token: string;
    access_token: string;
    expires_in: number;
  };
  user: {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseDateType>) {
  const { token, google_token } = req.body;
  try {
    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_BASEURL}/auth/refresh-token`, {
      token,
      google_token,
    });
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(error?.response?.status).json(error?.response?.data);
  }
}
