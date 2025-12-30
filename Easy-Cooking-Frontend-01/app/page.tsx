import { Metadata } from "next";
import HomeClient from "./components/sectionHome/Home";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: "Nội dung trang chủ",
};

export default function Home() {
  
  return (
    <>
      <HomeClient/>
    </>
  );
}
