import React from "react";
import StarSvg from "../../../assets/svg/star.svg";

type PlanCardProps = {
  title: string;
  description: string;
  pages: number;
  pdf: number;
  query: number;
  size: number;
  users: number;
  price: number;
};

const PlanCard: React.FC<PlanCardProps> = ({ title, description, pages, pdf, query, size, users, price }) => {
  const features = [
    description,
    `${pages} pages/PDF`,
    `${size} MB/PDF`,
    `${pdf} PDFs/day`,
    `${query} questions/day`,
    `${users} user`,
    "50 MB storage",
    "0 connectors",
  ];

  return (
    <div className="bg-bgRadialStart rounded-md p-2.5">
      <p className="my-3 text-lg font-medium text-center text-white">
        {title} {!!price && <span className="ml-2 text-base">${price}</span>}
      </p>
      <hr />
      <div className="py-3">
        {features.map((name, index) => (
          <div key={index} className="flex m-3">
            <StarSvg />
            <p className="ml-3 text-white">{name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanCard;
