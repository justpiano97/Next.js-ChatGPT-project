import axios from "axios";
import pdf from "pdf-parse";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseDateType = {
  data: any;
};

async function streamToString(stream: any) {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function render_page(pageData: any) {
  let render_options = {
    normalizeWhitespace: true,
    disableCombineTextItems: true,
  };

  return pageData.getTextContent(render_options).then(function (textContent: any) {
    let lastItem,
      lastX,
      lastY,
      text = "";
    for (let item of textContent.items) {
      if (lastItem) {
        lastX = lastItem.transform[4];
        lastY = lastItem.transform[5];

        if (lastY !== item.transform[5]) {
          text += " ";
        } else if (lastX + lastItem.width + 1 < item.transform[4]) {
          text += " ";
        }
      }
      text += item.str;
      lastItem = item;
    }
    return text;
  });
}

let options = {
  pagerender: render_page,
  preserveLineBreaks: true,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseDateType>) {
  const { fileId, google_token } = req.body;
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf&responseType=arraybuffer`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${google_token}`,
      Accept: "application/pdf",
      "Content-Type": "application/pdf",
    },
  });

  const stringfiedFile = await streamToString((response as any).body);
  const final = await pdf(stringfiedFile, options);
  res.json({ data: final.text });
}
