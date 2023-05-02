import { Disclosure } from "@headlessui/react";
import RightArrowSVG from "../../../assets/svg/right_arraw.svg";

interface AccordionType {
  title: string;
  children?: JSX.Element | Array<JSX.Element>;
}

const Accordion: React.FC<AccordionType> = ({ title, children }) => {
  return (
    <Disclosure>
      {({ open }) => (
        /* Use the `open` state to conditionally change the direction of an icon. */
        <>
          <Disclosure.Button className="flex items-center gap-3.5">
            <RightArrowSVG className={open ? "rotate-90 transform transition-all duration-300" : ""} />
            {title}
          </Disclosure.Button>
          <Disclosure.Panel>{children}</Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Accordion;
