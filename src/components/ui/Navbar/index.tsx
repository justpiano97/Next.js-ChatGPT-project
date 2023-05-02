import React, { useContext } from "react";

import { AuthContext } from "../../../layout/AuthContextProvider";
import Button from "../../basic/Button";
import Link from "next/link";

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="w-100 relative flex justify-between items-center bg-bgRadialStart rounded-md p-2.5">
      <img
        src={user?.picture}
        width={65}
        height={65}
        className="absolute rounded-full lg:-left-4 -left-2"
        alt="avatar"
      />
      <div className="flex items-center justify-between w-full">
        <div className="w-1/2 lg:w-4/12">
          <p className="text-base text-center text-lightText xl:text-xl md:text-xl sm:text-base lg:text-left md:text-left sm:text-left xl:pl-20 lg:pl-14 md:pl-14 sm:pl-14 pl-14">
            {user?.name}
          </p>
        </div>
        <div className="w-1/2 pr-3 text-right lg:w-8/12 sm:w-1/2 lg:pr-7">
          <span className="pl-4 text-base text-lightText sm:text-center 2xl:text-2xl xl:text-2xl lg:text-2xl md:text-2xl sm:text-base">
            Plan Basic
          </span>
        </div>
        <div className="pr-0 lg:pr-6">
          <Link href="/plan">
            <Button text="Edit" additionalClass="bg-purple" icon />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
