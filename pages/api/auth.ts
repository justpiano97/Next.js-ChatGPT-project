import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseDateType = {
  tokens: {
    accessToken: string;
    refreshToken: string;
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
    plan: any;
  };
  recent: any[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseDateType>) {
  const { tokens } = req.body;
  try {
    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_BASEURL}/auth/login`, { tokens });
    res.status(200).json({ ...data });
  } catch (error: any) {
    return res.status(500).json(error?.response?.data);
  }
}
