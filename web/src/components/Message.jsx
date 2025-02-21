import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Message({ text, link = "https://media.licdn.com/dms/image/C4E0BAQETYwVP3dD4og/company-logo_200_200/0/1630621385252?e=2147483647&v=beta&t=5aH-X42xzrPcrg5MWeNWW9kUq6rC6xMq6AmYAfSkttw", orientation }) {
  return (
    <div className={`flex ${orientation === "right" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-half flex items-center dark:text-white m-3 ${orientation === "right" ? "bg-[rgb(238,172,148)] dark:bg-[rgb(178,76,0)]" : "bg-[rgb(202,200,200)] dark:bg-[rgb(27,27,27)]"} text-black p-2 rounded-lg shadow-md`}>
        {orientation === "left" && (
          <Avatar>
            <AvatarImage src={orientation === "left" ? "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg" : link} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        )}
        <div className="mx-2">{text}</div>
        {orientation === "right" && (
          <Avatar>
            <AvatarImage src={link} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}