'use client'

import { useAuth } from "@/app/contexts/AuthContext"
import { Section1Home } from "./Section1-Home"
import Section2Home from "./Section2_Home"
import Section3Home from "./Section3-Home"
import Section4Home from "./Section4-Home"
import Section6Home from "./Section6-Home"


export default function HomeClient() {
  const { user, logout } = useAuth()

  return (
    <>
        {/* Section-1 */}
      <Section1Home />
      <Section2Home />
      <Section3Home />
      <Section4Home />
      <Section6Home title="Công Thức Mới Nhất"/>
      {/*End Section-1 */}
    </>
  )
}
