"use client";

import { useState } from "react";
import Puente from "@/components/Puente";
import InputLabel from "@/components/InputLabel";
import TextInput from "@/components/TextInput";
import MultipleTextInput from "@/components/MultipleTextInput";
import { Button } from "@/components/ui/button";
import { redirectUtil } from "@/utils/redirect";
import { LogoXL } from "@/components/LogoXL";

import { ModeToggle } from "@/components/ModeToggle";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EmployeeRegister() {
  const [name, setName] = useState("");
  const [skillset, setSkillset] = useState([]);
  const [background, setBackground] = useState("");
  const [Theme, setTheme] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isFilePicked, setIsFilePicked] = useState(false);
  const toggle1 = () => {
    setTheme(!Theme);
  };
  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setIsFilePicked(true);
  };

  async function extractTextCv() {
    const formData = new FormData();

    formData.append("file", selectedFile, selectedFile.name);

    const response = await fetch(`${API_URL}/extract`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    return data;
  }

  async function register() {
    const cv = await extractTextCv();

    const requestObject = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        skillset,
        background,
        cv,
      }),
    };

    const response = await fetch(`${API_URL}/employees/`, requestObject);

    if (response.ok) {
      redirectUtil("/");
    }
  }

  return (
    <main className="w-full h-screen flex flex-col items-center justify-center bg-[rgb(221,218,216)] dark:bg-[rgb(27,27,27)]">
      <div
        className={`flex flex-col items-center justify-center absolute right-0 -top-[40px] transform-all duration-300 ease-in-out ${Theme ? "top-[0px]" : ""}`}
      >
        <ModeToggle />
        <div
          onClick={toggle1}
          className={`bg-[rgb(252,252,252)] dark:bg-[rgb(0,0,0)] w-full text-center rounded cursor-pointer `}
        >
          ▼
        </div>
      </div>
      <div className="p-4 rounded-xl shadow-2xl bg-white dark:bg-[rgb(0,0,0)]">
        <LogoXL />
        <div className="mt-5">
          <div>
            <InputLabel prompt="What is the name of your business?" />
            <TextInput value={name} setValue={setName} />
          </div>
          <div className="mt-5">
            <InputLabel prompt="What category does your business fall in?" />
            <MultipleTextInput values={skillset} setValues={setSkillset} />
          </div>
          <div className="mt-5">
            <InputLabel prompt="Describe the services that the company offers" />
            <TextInput value={background} setValue={setBackground} />
          </div>
          <div className="flex mt-5 items-center">
            <InputLabel prompt="Upload a PDF file with your business info" />
            <div className="mx-5">
              <input type="file" name="file" onChange={changeHandler} />
            </div>
          </div>
        </div>
        <div className="m-5">
          <Button
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              register();
            }}
          >
            Register
          </Button>
        </div>
      </div>
    </main>
  );
}
