"use client";

import { useState } from "react";
import Puente from "@/components/Puente";
import InputLabel from "@/components/InputLabel";
import TextInput from "@/components/TextInput";
import { Button } from "@/components/ui/button";
import { redirectUtil } from "@/utils/redirect";
import {LogoXL}   from "@/components/LogoXL";

import { ModeToggle } from "@/components/ModeToggle";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CompanyLogin() {
  const [name, setName] = useState("");
  const [Theme, setTheme] = useState(false);
  const login = async () => {
    const response = await fetch(`${API_URL}/clients/?name=${name}`);
    const data = await response.json();

    const id = data.id;
    redirectUtil(`/company/${id}`);
  };
  const toggle1 = () => {
    setTheme(!Theme);
  };
  return (
    <main className="w-full h-screen flex flex-col items-center justify-center bg-[rgb(221,218,216)] dark:bg-[rgb(27,27,27)] ">
      <div className={`flex flex-col items-center justify-center absolute right-0 -top-[40px] transform-all duration-300 ease-in-out ${Theme ? "top-[0px]" : ""}`}>
        <ModeToggle/>
        <div onClick={toggle1} className={`bg-[rgb(252,252,252)] dark:bg-[rgb(27,27,27)] w-full text-center rounded cursor-pointer `}>▼</div>
      </div>
      <div className="p-10 rounded-xl shadow-2xl bg-white dark:bg-[rgb(0,0,0)]">
      <LogoXL />
      <div className="mt-5">
        <div>
          <InputLabel prompt="Write your company name" />
          <TextInput value={name} setValue={setName} />
        </div>
      </div>
      <div className="mt-20">
        <Button
          onClick={(e) => {
            e.preventDefault();
            login();
          }}
        >
          Login
        </Button>
      </div>
      </div>
      
    </main>
  );
}
