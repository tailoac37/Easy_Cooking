import Image from "next/image";

const teamMembers = [
  { name: "Trương Quang Hợp", role: "Master Chef", image: "/avatarTruongHop.jpg" },
  { name: "Izabella Tabakova", role: "Chef Extraordinaire", image: "/avatarTruongHop.jpg" },
  { name: "Fatima Delgadillo", role: "Chef Extraordinaire", image: "/avatarTruongHop.jpg" },
];

export default function Section3AboutTeam() {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      {/* Tiêu đề */}
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-14 leading-tight">
        An incredible team of talented <br /> chefs and foodies
      </h2>

      {/* Grid 3 người căn giữa */}
      <div className="flex flex-wrap justify-center gap-12">
        {teamMembers.map((member, index) => (
          <div key={index} className="text-center">
            <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto mb-4">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="rounded-full object-cover shadow-sm"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {member.name}
            </h3>
            <p className="text-sm text-gray-500">{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
