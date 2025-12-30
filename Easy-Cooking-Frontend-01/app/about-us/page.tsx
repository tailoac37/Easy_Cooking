import { Metadata } from "next";
import Section1AboutHeader from "../components/about/Section1-About";
import Section3AboutMission from "../components/about/Section3-About";
import Section2AboutIntro from "../components/about/Section2-About";
import Section4AboutLocation from "../components/about/Section4-About";

export const metadata: Metadata = {
  title: "About Us",
  description: "Nội dung About Us",
};

export default function AboutUsPage() {
  return (
    <>
      <div className="container mx-auto px-6">
        <Section1AboutHeader />
        <Section2AboutIntro />
        <Section3AboutMission />
        <Section4AboutLocation />
      </div>
    </>
  );
}
