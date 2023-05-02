import React, { useContext, useState, useEffect } from "react";
import * as yup from "yup";
import axios from "axios";
import { FieldValues, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { BeatLoader } from "react-spinners";

import Button from "../../components/basic/Button";
import Input from "../../components/basic/Input";
import MasterCardIcon from "../../../src/assets/svg/masterCardIcon.svg";
import Navbar from "../../components/ui/Navbar";
import PlanCard from "../../components/ui/PlanCard";
import { AuthContext } from "../AuthContextProvider";

const userSchema = yup.object().shape({
  firstName: yup.string().required("First Name is a required field"),
  lastName: yup.string().required("Last Name is a required field"),
});

const cardSchema = yup.object().shape({
  cardNumber: yup.string().required("Card number is missing.").length(19, "Card number must be 16 characters"),
  cardExpiry: yup.string().required("Expiry is missing.").length(7, "Card expiry must be 4 characters"),
  cvc: yup.string().required("CVC is missing.").length(3, "Card cvc must be 3 characters"),
});

const planDescription = ["Free plan", "Ideal for medium-sized businesses", "Ideal for large businesses"];

const UserLayout: React.FC = () => {
  const { push } = useRouter();
  const { user, tokens } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const [isPaymentMethod, setIsPaymentMethod] = useState(false);
  const [cardInfo, setCardInfo] = useState<{ number: string; expiry: string }>({ number: "", expiry: "" });

  const [profileEditable, setProfileEditable] = useState(false);
  const [cardEditable, setCardEditable] = useState(false);

  const [plan, setPlan] = useState<undefined | { [key: string]: any }>();

  const {
    handleSubmit: userHandleSubmit,
    register: userRegister,
    formState: { errors: userErrors },
    reset: userReset,
  } = useForm({
    resolver: yupResolver(userSchema),
  });

  const {
    handleSubmit: cardHandleSubmit,
    register: cardRegister,
    watch: cardWatch,
    reset: cardReset,
    formState: { errors: cardErrors },
  } = useForm({
    resolver: yupResolver(cardSchema),
  });
  const number = cardWatch("cardNumber", "");
  const expiry = cardWatch("cardExpiry", "");
  const cvc = cardWatch("cvc", "");

  useEffect(() => {
    cardReset({ cardNumber: formatCardNumber(number), cardExpiry: formatExpiry(expiry), cvc: formatCvc(cvc) });
    setCardInfo({
      number: number.slice(-4).padStart(16, "•"),
      expiry: formatExpiry(expiry),
    });
  }, [number, expiry, cvc]);

  const formatCardNumber = (value: string) => {
    const currentValue = value?.replace(/[^\d]/g, "");
    if (currentValue?.length > 16) return currentValue.slice(0, 16);
    else return currentValue?.replace(/(\d{4})/g, "$1 ")?.replace(/[^\d]+$/g, "");
  };

  const formatExpiry = (value: string) => {
    const currentValue = value?.replace(/[^\d]/g, "");
    if (currentValue?.length > 4) {
      return currentValue.slice(0, 4);
    } else return currentValue?.replace(/(\d{2})/g, "$1 / ")?.replace(/[^\d]+$/g, "");
  };

  const formatCvc = (value: string) => {
    const currentValue = value?.replace(/[^\d]/g, "");
    if (currentValue?.length > 3) {
      return currentValue.slice(0, 3);
    } else return currentValue;
  };

  async function getCustomerInfo() {
    try {
      setIsLoading(true);
      const token = tokens?.accessToken;
      if (token) {
        const { data } = await axios.post("api/stripe/get-customer-info", { token: token });
        const [first, last] = data?.user?.name?.split(" ");
        setPlan(data.plan);
        userReset({ firstName: first, lastName: last });
        if (data?.payment_methods?.data?.length > 0) {
          setCardInfo({
            number: data?.payment_methods?.data[0].card.last4.padStart(16, "•"),
            expiry:
              data?.payment_methods?.data[0].card.exp_month +
              " / " +
              data?.payment_methods?.data[0].card.exp_year.toString().slice(-2),
          });
          setIsPaymentMethod(true);
        }
      }
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      push("/");
    }
  }

  useEffect(() => {
    if (!user) {
      push("/");
    }
    getCustomerInfo();
  }, []);

  const savePersonalInfo = async (data: FieldValues) => {
    setIsLoading(true);
    try {
      await axios.post("api/profile", {
        userId: user?.id,
        accessToken: tokens?.accessToken,
        data: {
          name: `${data.firstName} ${data.lastName}`,
        },
      });
      setIsLoading(false);
      toast("Profile is updated");
    } catch (error) {
      setIsLoading(false);
      toast("Something went wrong");
    }
    setProfileEditable(false);
  };

  const saveCardInfo = async (data: FieldValues) => {
    setIsLoading(true);
    try {
      const token = tokens?.accessToken;
      const body = {
        number: data.cardNumber?.replace(/\s/g, ""),
        exp_month: data.cardExpiry?.split("/")[0].replace(/\s/g, ""),
        exp_year: "20" + data.cardExpiry?.split("/")[1].replace(/\s/g, ""),
        cvc: data.cvc,
      };
      await axios.post("api/stripe/create-customer", {
        token: token,
        data: body,
      });
      await getCustomerInfo();
      setIsLoading(false);
      setCardEditable(false);
      toast("Card is saved!");
    } catch (error: any) {
      toast(error?.response?.data?.message ?? "Some thing went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full md:flex">
      <div className="flex justify-center w-full h-full py-10 overflow-auto transition-all duration-300 shadow-lg dark:bg-bgRadialEnd bg-lightText dark:bg-gradient-radial xl:py-20">
        <div className="w-full mx-10 mt-8 max-w-1180 left-1/2 lg:mx-20 md:mx-15 sm:mx-10 2xl:mt-0 xl:mt-0 md:mt-8 sm:mt-8">
          <Navbar />
          <div className="grid grid-cols-12 gap-4 mt-16 md:gap-8">
            <div className="col-span-12 lg:col-span-8 md:col-span-6">
              <div className="flex items-center col-span-12 sm:col-span-12">
                <p className="mr-8 text-2xl">Personal Information</p>
                <Button icon={true} text="Edit" additionalClass="border" onClick={() => setProfileEditable(true)} />
              </div>
              <form
                onSubmit={userHandleSubmit(savePersonalInfo)}
                className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-9"
              >
                <div className="flex flex-col">
                  <p>First name</p>
                  <Input
                    name="firstName"
                    register={userRegister}
                    isEditable={profileEditable}
                    error={`${userErrors?.firstName?.message ?? ""}`}
                  />
                </div>
                <div className="flex flex-col">
                  <p>Last name</p>
                  <Input
                    name="lastName"
                    register={userRegister}
                    isEditable={profileEditable}
                    error={`${userErrors?.lastName?.message ?? ""}`}
                  />
                </div>
                <div></div>
                {profileEditable && (
                  <div className="flex justify-end gap-3 pt-8">
                    <Button type="submit" text="Save" additionalClass="border" loading={isLoading} />
                    <Button
                      text="Cancel"
                      additionalClass="border"
                      onClick={() => {
                        setProfileEditable(false);
                      }}
                    />
                  </div>
                )}
              </form>
              <form onSubmit={cardHandleSubmit(saveCardInfo)}>
                <div className="flex items-center mt-10">
                  <p className="mr-8 text-2xl">Your card</p>
                  <Button
                    text={isPaymentMethod ? "Edit" : "Add"}
                    icon
                    additionalClass="border"
                    onClick={() => {
                      setCardEditable(true);
                    }}
                  />
                </div>
                {isLoading ? (
                  <div className="mt-8 lg:w-1/2 md:w-full text-center">
                    <BeatLoader color="white" />
                  </div>
                ) : (
                  <div className="mt-8 lg:w-1/2 md:w-full">
                    {cardEditable ? (
                      <div>
                        <div>
                          <p>Card Number</p>
                          <Input
                            register={cardRegister}
                            placeholder="0000 0000 0000 0000"
                            name="cardNumber"
                            isEditable={cardEditable}
                            error={`${cardErrors?.cardNumber?.message ?? ""}`}
                          />
                        </div>
                        <div className="flex gap-4 mt-4">
                          <div className="w-full">
                            <p>Expire Date</p>
                            <Input
                              register={cardRegister}
                              placeholder="MM/YY"
                              name="cardExpiry"
                              isEditable={cardEditable}
                              error={`${cardErrors?.cardExpiry?.message ?? ""}`}
                            />
                          </div>
                          <div className="w-full">
                            <p>CVC</p>
                            <Input
                              register={cardRegister}
                              placeholder="000"
                              name="cvc"
                              isEditable={cardEditable}
                              error={`${cardErrors?.cvc?.message ?? ""}`}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-8 mb-4">
                          <Button text="Save" additionalClass="border" type="submit" loading={isLoading} />
                          <Button
                            text="Cancel"
                            additionalClass="border"
                            onClick={() => {
                              setCardEditable(false);
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      isPaymentMethod && (
                        <div className="p-6 text-base text-white rounded-md bg-purple bg-gradient-to-b from-indigo-500">
                          <p>YOUR NAME</p>
                          <div className="mt-10">{cardInfo.number}</div>
                          <div className="flex justify-between mt-3">
                            <p>{cardInfo.expiry}</p>
                            <MasterCardIcon />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </form>
            </div>
            {isLoading ? (
              <div className="col-span-12 mb-8 lg:col-span-4 md:col-span-6 text-center">
                <BeatLoader color="white" />
              </div>
            ) : (
              <div className="col-span-12 mb-8 lg:col-span-4 md:col-span-6">
                {!!plan && (
                  <PlanCard
                    title={`${plan.name}`}
                    description={planDescription[plan.id - 1]}
                    pages={plan.pages}
                    pdf={plan.pdf}
                    query={plan.query}
                    size={plan.size}
                    users={plan.user}
                    price={plan.price}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
