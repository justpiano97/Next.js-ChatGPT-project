import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseDateType = {
  user: {
    id: string;
    email: string;
    google_id: string;
    name: string;
    picture: string;
    current_plan_id: number;
    subscription_id: number;
    stripe_customer_id: string;
    role: string;
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseDateType>) {
  const { userId, accessToken, data } = req.body;
  try {
    const { data: response } = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_API_BASEURL}/user/${userId}`,
      { data },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    res.status(200).json({ ...response });
  } catch (error: any) {
    return res.status(500).json(error?.response?.data);
  }
}
