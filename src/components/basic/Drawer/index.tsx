import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";

interface DrawerProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  children?: JSX.Element | Array<JSX.Element>;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, setIsOpen, children }) => {
  const ref = useRef<any>(null);
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  return (
    <div
      ref={ref}
      className={`fixed bg-primary top-0 shadow-md left-0 z-50 h-screen w-screen md:w-fit bg-dark transition-all duration-300 py-3 px-5  ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex justify-end w-full">
        <button className="text-xl bg-transparent border-none text-bright" onClick={() => setIsOpen(false)}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8.17 13.83L13.83 8.17M13.83 13.83L8.17 8.17M8 21H14C19 21 21 19 21 14V8C21 3 19 1 14 1H8C3 1 1 3 1 8V14C1 19 3 21 8 21Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="w-full h-full pb-10">
        <div className="w-full h-full overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;
